import { CullMode } from "../../State/types";
import { ShaderDescriptor, ShaderType } from "../shaders/ShaderDescriptor";
import { GraphDescriptor } from "./GraphDescriptor";
import Property from "./Property";
import { buildStageGraph } from "./ShaderBuilder";
import StageGraph from "./StageGraph";
import { PropertyInterface } from "./Types";

class ShaderGraph {
  type?: ShaderType;

  lit = false;

  cullMode: CullMode = 'none';

  transparent = false;

  depthWriteEnabled = true;

  fragment = new StageGraph();

  properties: PropertyInterface[] = [];

  constructor(shaderDescriptor?: ShaderDescriptor) {
    if (shaderDescriptor?.properties) {
      this.properties = shaderDescriptor.properties.map((p) => (
        new Property(p.name, p.dataType, p.value)
      ))
    }
  
    if (shaderDescriptor?.graphDescriptor?.fragment) {
      this.fragment = buildStageGraph(shaderDescriptor.graphDescriptor?.fragment, this.properties);
    }
  
    this.type = shaderDescriptor?.type;
    this.lit = shaderDescriptor?.lit ?? false;
    this.cullMode = shaderDescriptor?.cullMode ?? 'none';
    this.transparent = shaderDescriptor?.transparent ?? false;
    this.depthWriteEnabled = shaderDescriptor?.depthWriteEnabled ?? true;
  }

  createShaderDescriptor(): ShaderDescriptor {
    const shaderDescriptor: ShaderDescriptor = {
      cullMode: this.cullMode === 'front' ? undefined : this.cullMode,
      transparent: this.transparent,
      depthWriteEnabled: this.depthWriteEnabled,
      lit: this.lit,
      
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
}

export default ShaderGraph;
