import { gpu } from "../Gpu";
import { bloom } from "../RenderSetings";
import { common } from "../shaders/common";
import { getFragmentStage } from "../shaders/fragmentStage";
import { phongFunction } from "../shaders/blinnPhongFunction";
import { twirlFunction } from '../shaders/twirlFunction';
import { getVertexStage } from "../shaders/vertexStage";
import { voronoiFunction } from "../shaders/voronoiFunction";
import { DrawableType } from "../types";
import { GraphNodeDescriptor, GraphStageDescriptor, PropertyDescriptor, ValueDescriptor } from "./GraphDescriptor";
import GraphEdge from "./GraphEdge";
import Add from "./Nodes/Add";
import Combine from "./Nodes/Combine";
import Display from "./Nodes/Display";
import Fraction from "./Nodes/Fraction";
import Lerp from "./Nodes/Lerp";
import Multiply from "./Nodes/Multiply";
import PhongShading from "./Nodes/PhongShading";
import Power from "./Nodes/Power";
import SampleTexture from "./Nodes/SampleTexture";
import Split from "./Nodes/Split";
import Subtract from "./Nodes/Subtract";
import TileAndScroll from "./Nodes/TileAndScroll";
import Time from "./Nodes/Time";
import Twirl from "./Nodes/Twirl";
import UV from "./Nodes/UV";
import Vector from "./Nodes/Vector";
import Voronoi from "./Nodes/Voronoi";
import PropertyNode from "./PropertyNode";
import ShaderGraph from "./ShaderGraph";
import StageGraph from "./StageGraph";
import { DataType, GraphEdgeInterface, GraphNodeInterface, PropertyInterface, getLength } from "./Types";
import Value from "./Value";
import ValueNode from "./ValueNode";
import VertexColor from "./Nodes/VertexColor";
import { meshInstances } from "../shaders/meshInstances";
import Step from "./Nodes/Step";
import Clamp from "./Nodes/Clamp";
import Max from "./Nodes/Max";
import Min from "./Nodes/Min";
import FWidth from "./Nodes/FWidth";
import Divide from "./Nodes/Divide";
import TextureSize from "./Nodes/TextureSize";
import Inverse from "./Nodes/Inverse";
import Distance from "./Nodes/Distance";
import { resetContanstNames } from "./Ports/InputPort";

interface NodeConstructor {
  new (nodeDescriptor: GraphNodeDescriptor): GraphNodeInterface
}

const nodeTable: NodeConstructor[] = [
  SampleTexture, Display, Distance, Divide, UV, Time,
  TileAndScroll, Fraction, FWidth, Inverse, Max,
  Min, Multiply, Add,
  PhongShading, Split, Clamp, Combine, Power, Twirl, Voronoi, Lerp, Step, Subtract,
  TextureSize, VertexColor,
]

export const buildStageGraph = (graphDescr: GraphStageDescriptor, properties: PropertyInterface[]): StageGraph => {
  let nodes: GraphNodeInterface[] = [];
  let edges: GraphEdgeInterface[] = [];

  console.log('build graph');

  resetContanstNames();

  // Create the nodes
  for (const nodeDescr of graphDescr.nodes) {
    // Make sure the id does not already exist.
    const prevNode = nodes.find((n) => nodeDescr.id === n.id);

    if (prevNode) {
      // The id already exists. Find the maxiumum node id and set it to the next one.
      // This may cause links to drop but it is better than losing nodes.
      const maxId = nodes.reduce((prev, n) => (
        Math.max(prev, n.id)
      ), 0);

      nodeDescr.id = maxId + 1;
    }

    let node: GraphNodeInterface | null = null;

    // TODO: The database entries should be updated so that these old names are updated to the new names.
    if (nodeDescr.type === 'display') {
      nodeDescr.type = 'Display';
    }
    else if (nodeDescr.type === 'time') {
      nodeDescr.type = 'Time'
    }
    else if (nodeDescr.type === 'uv') {
      nodeDescr.type = 'UV'
    }

    const tableEntry = nodeTable.find((entry) => entry.name === nodeDescr.type);

    if (tableEntry) {
      node = new tableEntry(nodeDescr)
    }
    else {
      switch (nodeDescr.type) {
        case 'property': 
          const propertyNode = nodeDescr as PropertyDescriptor;

          // Find property in property table
          const prop = properties.find((p) => p.name === propertyNode.name);

          if (prop) {
            node = new PropertyNode(prop, nodeDescr.id)
          }
          break;

        case 'value': {
          const vnode = nodeDescr as ValueDescriptor;

          if (['vec2f', 'vec3f', 'vec4f'].includes(vnode.dataType)) {
            node = new Vector(new Value(vnode.dataType, vnode.value), vnode.id)
          }
          else {
            node = new ValueNode(new Value(vnode.dataType, vnode.value), nodeDescr.id);
          }
      
          break;
        }

        default:
          console.log(`node type not found: ${nodeDescr.type}`)
      }
    }

    if (node) {
      node.position = { x: nodeDescr.x ?? 0, y: nodeDescr.y ?? 0 }

      if (nodeDescr.portValues) {
        for (const portValue of nodeDescr.portValues) {
          const port = node.inputPorts.find((p) => p.name === portValue.port);

          if (port) {
            switch (port.dataType) {
              case 'float':
              case 'vec2f':
              case 'vec3f':
              case 'vec4f':
                if (Array.isArray(portValue.value)) {
                  const originalLength = portValue.value.length;
                  portValue.value.length = getLength(port.dataType)

                  for (let i = originalLength; i < portValue.value.length; i += 1) {
                    portValue.value[i] = 0;
                  }
                }
    
                port.value = new Value(port.dataType, portValue.value)
    
                break;

              case 'uv':
                port.value = new Value(port.dataType, 0);
                break;
            }
          }
        }
      }

      nodes.push(node);
    }
  }

  for (const edgeDescr of graphDescr.edges) {
    const outputNode = nodes.find((n) => n.id === edgeDescr[0].id);
    const inputNode = nodes.find((n) => n.id === edgeDescr[1].id);

    if (outputNode && inputNode) {
      const inputPort = inputNode.inputPorts.find((p) => p.name === edgeDescr[1].port);
      const outputPort = outputNode.outputPort.find((p) => p.name === edgeDescr[0].port);

      // Make sure we have an output port, an input port and the input port does
      // not currently have an assigned edge.
      if (outputPort && inputPort && !inputPort.edge) {
        const edge = new GraphEdge(outputPort, inputPort);
        edges.push(edge);
      }
    }
  }

  const result = new StageGraph();
  result.nodes = nodes;
  result.edges = edges;

  return result;
}

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

const generateShaderCode = (
  graph: ShaderGraph,
  drawableType: DrawableType,
  vertProperties: PropertyInterface[],
): [string, PropertyInterface[], PropertyInterface[]] => {
  let fragmentBody = '';

  let vertBindings = '';
  let fragBindings = '';
  let vertUniforms = '';
  let fragUniforms = '';
  let fragProperties: PropertyInterface[] = [];

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

  [fragmentBody, fragProperties] = graph.fragment.generateStageShaderCode(graph.editMode);

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
      drawableType === '2D' || drawableType === 'Mesh2D'
        ? ''
        : meshInstances
    }

    ${vertUniforms}

    ${vertBindings}

    ${fragUniforms}

    ${fragBindings}
    
    ${getVertexStage(drawableType, graph.lit)}

    ${(graph.lit) ? phongFunction : ''}

    ${twirlFunction}

    ${voronoiFunction}

    ${getFragmentStage(fragmentBody, graph.lit, bloom)}
    `,
    vertProperties,
    fragProperties,
  ]
}

export const generateShaderModule = (
  graph: ShaderGraph,
  drawableType: DrawableType,
  vertexProperties: PropertyInterface[],
): [GPUShaderModule, PropertyInterface[], PropertyInterface[], string] => {
  const [code, vertProperties, fragProperties] = generateShaderCode(graph, drawableType, vertexProperties);

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

  return [shaderModule, vertProperties, fragProperties, code];
}
