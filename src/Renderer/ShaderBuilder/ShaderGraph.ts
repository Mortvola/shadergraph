import { DrawableType } from '../Drawables/DrawableInterface';
import { gpu } from '../Gpu';
import { bloom } from '../RenderSettings';
import { blinnPhongFunction } from '../shaders/functions/blinnPhongFunction';
import { common } from '../shaders/common';
import { getFragmentStage } from '../shaders/fragmentStage';
import { meshInstances } from '../shaders/meshInstances';
import type { ShaderDescriptor, ShaderType } from '../shaders/ShaderDescriptor';
import { twirlFunction } from '../shaders/functions/twirlFunction';
import { getVertexStage } from '../shaders/vertex/vertexStage';
import { voronoiFunction } from '../shaders/functions/voronoiFunction';
import type { DataType, GraphDescriptor } from './GraphDescriptor';
import Property from './Property';
import StageGraph from './StageGraph';
import type { GraphNodeInterface, PropertyInterface, ShaderModule, ShaderModuleSettings } from './Types';
import type Display from './Nodes/Display'
import { BlendMode } from './Types';
import { runInAction } from 'mobx';
import { CullMode } from './Types';

class ShaderGraph {
  type?: ShaderType;

  fragment: StageGraph;

  properties: PropertyInterface[] = [];

  editMode = false;

  constructor(shaderDescriptor?: ShaderDescriptor, editMode = false) {
    if (shaderDescriptor?.properties) {
      this.properties = shaderDescriptor.properties.map((p) => (
        new Property(p.name, p.dataType, p.value)
      ))
    }

    this.fragment = new StageGraph(
      shaderDescriptor?.graphDescriptor?.fragment ?? {
        nodes: [],
        edges: [],
      },
      this.properties,
    );

    this.type = shaderDescriptor?.type;

    const displayNode = this.getDisplayNode();

    if (displayNode) {
      // If this is an older shader descriptor, extract the settings from the descriptor.
      runInAction(() => {
        if ((shaderDescriptor as { transparent: boolean })?.transparent !== undefined) {
          displayNode.settings.transparent = (shaderDescriptor as { transparent: boolean }).transparent
        }

        if ((shaderDescriptor as { cullMode: CullMode })?.cullMode !== undefined) {
          displayNode.settings.cullMode = (shaderDescriptor as { cullMode: CullMode }).cullMode
        }

        if ((shaderDescriptor as { depthWriteEnabled: boolean })?.depthWriteEnabled !== undefined) {
          displayNode.settings.depthWriteEnabled = (shaderDescriptor as { depthWriteEnabled: boolean }).depthWriteEnabled
        }

        if ((shaderDescriptor as { lit: boolean })?.lit !== undefined) {
          displayNode.settings.lit = (shaderDescriptor as { lit: boolean }).lit
        }
      })
    }

    this.editMode = editMode;
  }

  getDisplayNode(): Display | undefined {
    return this.fragment.getDisplayNode()
  }

  createShaderDescriptor(): ShaderDescriptor {
    const shaderDescriptor: ShaderDescriptor = {
      properties: this.properties.map((p) => ({
        name: p.name,
        dataType: p.value.dataType,
        value: p.value.value,
      })),

      graphDescriptor: this.createDescriptor(),
    }

    return shaderDescriptor;
  }

  createDescriptor(): GraphDescriptor {
    const descriptor: GraphDescriptor = {
      vertex: {
        nodes: [],
        edges: [],
      },

      fragment: this.fragment.createDescriptor(),
    }

    return descriptor;
  }

  generateShaderCode (
    drawableType: DrawableType,
    vertProperties: PropertyInterface[],
    root?: GraphNodeInterface,
  ): [string, PropertyInterface[], PropertyInterface[], ShaderModuleSettings ] {
    const bindingType = (dataType: DataType) => {
      if (dataType === 'texture2D') {
        return 'texture_2d<f32>';
      }

      if (dataType === 'float') {
        return 'f32';
      }

      if (dataType === 'color') {
        return 'vec4f'
      }

      return dataType;
    }

    const space = (dataType: DataType) => {
      if (dataType !== 'texture2D' && dataType !== 'sampler') {
        return '<uniform>';
      }

      return '';
    }

    let fragmentBody = '';

    let vertBindings = '';
    let fragBindings = '';
    let vertUniforms = '';
    let fragUniforms = '';
    let fragProperties: PropertyInterface[] = [];
    let settings: ShaderModuleSettings = {
      transparent: false,
      blendMode: BlendMode.Alpha,
      cullMode: CullMode.None,
      depthWriteEnabled: true,
      lit: false,
    }

    let numVertBindings = 0;
    let numFragBindings = 0;
    let group = 2;

    for (let i = 0; i < vertProperties.length; i += 1) {
      vertUniforms = vertUniforms.concat(
        `${vertProperties[i].name}: ${bindingType(vertProperties[i].value.dataType)},`
      )
    }

    if (vertUniforms !== '') {
      vertBindings = vertBindings.concat(
        `@group(${group}) @binding(${numVertBindings}) var<uniform> vertProperties: VertProperties;`
      )
      group += 1;
      numVertBindings += 1;

      vertUniforms = `struct VertProperties { ${vertUniforms} }\n`
    }

    [fragmentBody, fragProperties, settings] = this.fragment.generateCode(this.editMode, root);

    console.log(fragmentBody);

    for (let i = 0; i < fragProperties.length; i += 1) {
      if (fragProperties[i].value.dataType === 'texture2D' || fragProperties[i].value.dataType === 'sampler') {
        fragBindings = fragBindings.concat(
          `@group(${group}) @binding(${numFragBindings}) var${space(fragProperties[i].value.dataType)} ${fragProperties[i].name}: ${bindingType(fragProperties[i].value.dataType)};\n`
        )

        numFragBindings += 1;
      }
      else {
        fragUniforms = fragUniforms.concat(
          `${fragProperties[i].name}: ${bindingType(fragProperties[i].value.dataType)},`
        )
      }
    }

    if (fragUniforms !== '') {
      fragBindings = fragBindings.concat(
        `@group(${group}) @binding(${numFragBindings}) var<uniform> fragProperties: FragProperties;`
      )
      group += 1;
      numFragBindings += 1;

      fragUniforms = `struct FragProperties { ${fragUniforms} }\n`
    }

    return [
      `    
      ${common}
  
      ${
        drawableType === DrawableType.TwoD || drawableType === DrawableType.Mesh2D
          ? ''
          : meshInstances
      }
  
      ${vertUniforms}
  
      ${vertBindings}
  
      ${fragUniforms}
  
      ${fragBindings}
      
      ${getVertexStage(drawableType, settings.lit)}
  
      ${(settings.lit) ? blinnPhongFunction : ''}
  
      ${twirlFunction}
  
      ${voronoiFunction}
  
      ${getFragmentStage(fragmentBody, settings.lit, bloom)}
      `,
      vertProperties,
      fragProperties,
      settings,
    ]
  }

  generateShaderModule (
    drawableType: DrawableType,
    vertexProperties: PropertyInterface[],
    root?: GraphNodeInterface,
  ): ShaderModule {
    const [code, vertProperties, fragProperties, settings] = this.generateShaderCode(drawableType, vertexProperties, root);

    let shaderModule: GPUShaderModule
    try {
      shaderModule = gpu.device.createShaderModule({
        label: 'custom shader',
        code: code,
      })
    }
    catch (error) {
      console.log(code)
      console.log(error);
      throw error;
    }

    return {
      module: shaderModule,
      vertProperties,
      fragProperties,
      code,
      settings,
    };
  }
}

export default ShaderGraph;
