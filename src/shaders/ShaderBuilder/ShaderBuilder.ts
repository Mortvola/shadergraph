import { gpu } from "../../Gpu";
import { MaterialDescriptor } from "../../Materials/MaterialDescriptor";
import { common } from "../common";
import { textureAttributes } from "../textureAttributes";
import { texturedCommon } from "../texturedCommon";
import { texturedVertex } from "../texturedVertex";
import { GraphStageDescriptor, PropertyDescriptor } from "./GraphDescriptor";
import GraphEdge from "./GraphEdge";
import GraphNode from "./GraphNode";
import Output from "./Nodes/Display";
import Multiply from "./Nodes/Multiply";
import SampleTexture from "./Nodes/SampleTexture";
import TileAndScroll from "./Nodes/TileAndScroll";
import Time from "./Nodes/Time";
import UV from "./Nodes/UV";
import OperationNode from "./OperationNode";
import PropertyNode from "./PropertyNode";
import { GraphNodeInterface, OperationNodeInterface } from "./Types";

let nextVarId = 0;
const getNextVarId = () => {
  nextVarId += 1;
  return nextVarId;
}

export const buildGraph = (graph: GraphStageDescriptor): string => {
  let body = '';
  let nodes: GraphNode[] = [];
  let outputNode: Output | null = null;

  // Create the nodes
  for (const nodeDescr of graph.nodes) {
    switch (nodeDescr.type) {
      case 'SampleTexture':
        nodes.push(new SampleTexture(nodeDescr.id));
        break;

      case 'property': 
        const propertyNode = nodeDescr as PropertyDescriptor;
        nodes.push(new PropertyNode(propertyNode.name, propertyNode.dataType, propertyNode.value, nodeDescr.id))
        break;

      case 'display':
        outputNode = new Output(nodeDescr.id);
        break;

      case 'uv':
        nodes.push(new UV(nodeDescr.id));
        break;

      case 'time':
        nodes.push(new Time(nodeDescr.id));
        break;

      case 'TileAndScroll':
        nodes.push(new TileAndScroll(nodeDescr.id));
        break;

      case 'Multiply':
        nodes.push(new Multiply(nodeDescr.id));
        break;
    }
  }

  if (outputNode) {
    nodes = [
      outputNode,
      ...nodes,
    ]

    nextVarId = 0;

    const operations: GraphNode[] = [];

    for (const inputNode of nodes) {
      if (inputNode.type === 'property') {

      }
      else {
        const inputOperation = inputNode as OperationNode;

        // Find input edges for each of the node's input ports
        for (const inputPort of inputOperation.inputPorts) {
          if (inputPort.edge === null) {
            const edge = graph.edges.find((e) => e[1].graphNodeId === inputOperation!.id && e[1].port === inputPort.name)

            if (edge) {
              // Follow edge to get the output from the attached node.
              const other = nodes.find((n) => n.id === edge[0].graphNodeId);

              if (other) {
                const varName = `v${getNextVarId()}`

                if (other.type === 'property') {
                  const propertyNode = other as PropertyNode;

                  const edge = new GraphEdge(propertyNode.outputPort, inputPort);
                  if (edge.getVarName() === '') {
                    edge.setVarName(varName);
                  }
                }
                else {
                  // Assign a variable name to the output
                  const outputOperation = other as OperationNode;
                  var outputPort = outputOperation.outputPort

                  if (outputPort) {
                    const edge = new GraphEdge(outputPort, inputPort);
                    if (edge.getVarName() === '') {
                      edge.setVarName(varName)
                    }
  
                    operations.push(inputNode);  
                  }
                }
              }
            }
          }
        }
      }
    }

    // Output the instructions.
    let stack: GraphNodeInterface[] = [outputNode];

    while (stack.length > 0) {
      const node = stack[0];
      stack = stack.slice(1)

      if (node.type !== 'property') {
        const operationNode = (node as OperationNodeInterface);
        const text = operationNode.output();
        body = `${text} ${body}`;

        for (const input of operationNode.inputPorts) {
          if (input.edge) {
            stack.push(input.edge.output.node);
          }
        }
      }
    }
  }

  return body;
}

export const buildFromGraph = (materialDescriptor: MaterialDescriptor) => {
  let body = '';

  if (materialDescriptor.graph?.fragment) {
    body = buildGraph(materialDescriptor.graph?.fragment);
  }

  const code = `
    ${texturedCommon}
    
    ${common}
  
    ${texturedVertex}
    
    ${textureAttributes}

    @group(2) @binding(1) var ourSampler: sampler;
    @group(2) @binding(2) var ourTexture: texture_2d<f32>;
    @group(2) @binding(3) var<uniform> texAttr: TextureAttributes;
    
    @fragment
    fn fs(vertexOut: VertexOut) -> @location(0) vec4f
    {
      ${body}
    }
  `

  const shaderModule = gpu.device.createShaderModule({
    label: 'custom shader',
    code: code,
  })

  return shaderModule;
}
