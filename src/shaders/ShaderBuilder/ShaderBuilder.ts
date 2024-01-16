import { gpu } from "../../Gpu";
import { MaterialDescriptor } from "../../Materials/MaterialDescriptor";
import { common } from "../common";
import { textureAttributes } from "../textureAttributes";
import { texturedCommon } from "../texturedCommon";
import { texturedVertex } from "../texturedVertex";
import { GraphDescriptor, GraphStageDescriptor, PropertyDescriptor } from "./GraphDescriptor";
import GraphEdge from "./GraphEdge";
import Output from "./Nodes/Display";
import Multiply from "./Nodes/Multiply";
import SampleTexture from "./Nodes/SampleTexture";
import TileAndScroll from "./Nodes/TileAndScroll";
import Time from "./Nodes/Time";
import UV from "./Nodes/UV";
import OperationNode from "./OperationNode";
import PropertyNode from "./PropertyNode";
import { GraphEdgeInterface, GraphNodeInterface, OperationNodeInterface, isPropertyNode } from "./Types";

let nextVarId = 0;
const getNextVarId = () => {
  nextVarId += 1;
  return nextVarId;
}

export const buildGraph = (graph: GraphStageDescriptor): { nodes: GraphNodeInterface[], edges: GraphEdgeInterface[] } => {
  let nodes: GraphNodeInterface[] = [];
  let edges: GraphEdgeInterface[] = [];

  // Create the nodes
  for (const nodeDescr of graph.nodes) {
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

    switch (nodeDescr.type) {
      case 'SampleTexture':
        node = new SampleTexture(nodeDescr.id)
        break;

      case 'property': 
        const propertyNode = nodeDescr as PropertyDescriptor;
        node = new PropertyNode(propertyNode.name, propertyNode.dataType, propertyNode.value, nodeDescr.id)
        break;

      case 'display':
        node = new Output(nodeDescr.id);
        break;

      case 'uv':
        node = new UV(nodeDescr.id)
        break;

      case 'time':
        node = new Time(nodeDescr.id);
        break;

      case 'TileAndScroll':
        node = new TileAndScroll(nodeDescr.id);
        break;

      case 'Multiply':
        node = new Multiply(nodeDescr.id);
        break;
    }

    if (node) {
      node.x = nodeDescr.x ?? 0;
      node.y = nodeDescr.y ?? 0;

      nodes.push(node);
    }
  }

  for (const edgeDescr of graph.edges) {
    const outputNode = nodes.find((n) => n.id === edgeDescr[0].id) as OperationNode;
    const inputNode = nodes.find((n) => n.id === edgeDescr[1].id) as OperationNode;

    if (outputNode && inputNode) {
      const inputPort = inputNode.inputPorts.find((p) => p.name === edgeDescr[1].port);

      // Make sure we have an output port, an input port and the input port does
      // not currently have an assigned edge.
      if (outputNode.outputPort && inputPort && !inputPort.edge) {
        const edge = new GraphEdge(outputNode.outputPort, inputPort);
        edges.push(edge);
      }
    }
  }

  return { nodes, edges }
}

// const assignVariables = (nodes: GraphNodeInterface[]) => {
//   // Find the output node
//   const outputNode = nodes.find((n) => n.type === 'display');

//   if (outputNode) {
//     let stack: GraphNodeInterface[] = [outputNode];

//     while (stack.length > 0) {
//       const inputNode = stack[0];
//       stack = stack.slice(1)

//       if (inputNode.type === 'property') {

//       }
//       else {
//         const inputOperation = inputNode as OperationNode;

//         // Find input edges for each of the node's input ports
//         for (const inputPort of inputOperation.inputPorts) {
//           if (inputPort.edge === null) {
//             const edge = graph.edges.find((e) => e[1].id === inputOperation!.id && e[1].port === inputPort.name)

//             if (edge) {
//               // Follow edge to get the output from the attached node.
//               const other = nodes.find((n) => n.id === edge[0].id);

//               if (other) {
//                 const varName = `v${getNextVarId()}`

//                 if (other.type === 'property') {
//                   const propertyNode = other as PropertyNode;

//                   const edge = new GraphEdge(propertyNode.outputPort, inputPort);
//                   if (edge.getVarName() === '') {
//                     edge.setVarName(varName);
//                   }
//                 }
//                 else {
//                   // Assign a variable name to the output
//                   const outputOperation = other as OperationNode;
//                   var outputPort = outputOperation.outputPort

//                   if (outputPort) {
//                     const edge = new GraphEdge(outputPort, inputPort);
//                     if (edge.getVarName() === '') {
//                       edge.setVarName(varName)
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }

export const generateShaderCode = (nodes: GraphNodeInterface[]): string => {
  let body = '';

  // Find the output node
  const outputNode = nodes.find((n) => n.type === 'display');

  if (outputNode) {
    nextVarId = 0;

    // Output the instructions.
    let stack: GraphNodeInterface[] = [outputNode];

    while (stack.length > 0) {
      const node = stack[0];
      stack = stack.slice(1)

      if (node.type !== 'property') {
        const operationNode = (node as OperationNodeInterface);

        // Push the input nodes onto the stack
        // and generate variables.
        for (const input of operationNode.inputPorts) {
          if (input.edge) {
            if (input.edge.getVarName() === '') {
              const varName = `v${getNextVarId()}`
              input.edge.setVarName(varName);
            }

            stack.push(input.edge.output.node);
          }
        }

        const text = operationNode.output();
        body = text.concat(body); // `${text} ${body}`;
      }
    }
  }

  return body;
}

export const buildFromGraph = (materialDescriptor: MaterialDescriptor) => {
  let body = '';

  if (materialDescriptor.graph?.fragment) {
    const  { nodes } = buildGraph(materialDescriptor.graph?.fragment);

    body = generateShaderCode(nodes);
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

export const createDescriptor = (nodes: GraphNodeInterface[], edges: GraphEdgeInterface[]): GraphDescriptor => {
  const descriptor: GraphDescriptor = {
    vertex: {
      nodes: [],
      edges: [],
    },

    fragment: {
      nodes: nodes.map((n) => {
        if (isPropertyNode(n)) {
          return ({
            id: n.id,
            type: n.type,  
            name: n.name,
            dataType: n.dataType,
            value: n.value,
            x: n.x,
            y: n.y,
          })
        }

        return ({
          id: n.id,
          type: n.type,
          x: n.x,
          y: n.y,
        })
      }),

      edges: edges.map((e) => (
        [{ id: e.output.node.id, port: e.output.name}, { id: e.input.node.id, port: e.input.name}]
      ))
    }
  }

  return descriptor;
}