import { GraphNodeDescriptor, GraphStageDescriptor, PropertyDescriptor, ValueDescriptor } from "./GraphDescriptor";
import GraphEdge from "./GraphEdge";
import { setNextVarid } from "./GraphNode";
import Add from "./Nodes/Add";
import Clamp from "./Nodes/Clamp";
import Combine from "./Nodes/Combine";
import Display from "./Nodes/Display";
import Distance from "./Nodes/Distance";
import Divide from "./Nodes/Divide";
import Fraction from "./Nodes/Fraction";
import FWidth from "./Nodes/FWidth";
import Inverse from "./Nodes/Inverse";
import Lerp from "./Nodes/Lerp";
import Max from "./Nodes/Max";
import Min from "./Nodes/Min";
import Multiply from "./Nodes/Multiply";
import PhongShading from "./Nodes/PhongShading";
import Power from "./Nodes/Power";
import Preview from "./Nodes/Preview";
import SampleTexture from "./Nodes/SampleTexture";
import Split from "./Nodes/Split";
import Step from "./Nodes/Step";
import Subtract from "./Nodes/Subtract";
import TextureSize from "./Nodes/TextureSize";
import TileAndScroll from "./Nodes/TileAndScroll";
import Time from "./Nodes/Time";
import Twirl from "./Nodes/Twirl";
import UV from "./Nodes/UV";
import Vector from "./Nodes/Vector";
import VertexColor from "./Nodes/VertexColor";
import Voronoi from "./Nodes/Voronoi";
import { resetConstantNames } from "./Ports/InputPort";
import Property from "./Property";
import PropertyNode from "./PropertyNode";
import { getLength, GraphEdgeInterface, GraphNodeInterface, isPropertyNode, PropertyInterface } from "./Types";
import Value from "./Value";
import ValueNode from "./ValueNode";

interface NodeConstructor {
  new (nodeDescriptor: GraphNodeDescriptor): GraphNodeInterface
}

const nodeTable: NodeConstructor[] = [
  SampleTexture, Display, Distance, Divide, UV, Time,
  TileAndScroll, Fraction, FWidth, Inverse, Max,
  Min, Multiply, Add,
  PhongShading, Split, Clamp, Combine, Power, Twirl, Voronoi, Lerp, Step, Subtract,
  TextureSize, VertexColor, Preview,
]

class StageGraph {
  nodes: GraphNodeInterface[] = [];

  edges: GraphEdgeInterface[] = [];

  constructor(graphDescr: GraphStageDescriptor, properties: PropertyInterface[]) {
    let nodes: GraphNodeInterface[] = [];
    let edges: GraphEdgeInterface[] = [];
  
    console.log('build graph');
  
    resetConstantNames();
  
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
  
    this.nodes = nodes;
    this.edges = edges;
  }

  createDescriptor(): GraphStageDescriptor {
    return {
      nodes: this.nodes.map((n) => n.createDescriptor()),
  
      edges: this.edges.map((e) => (
        [{ id: e.output.node.id, port: e.output.name}, { id: e.input.node.id, port: e.input.name}]
      ))
    }
  }

  generateStageShaderCode(editMode: boolean): [string, PropertyInterface[]] {
    // Clear the node priorities
    for (const node of this.nodes) {
      node.priority = null;
      node.setVarName(null);
    }
  
    const properties: PropertyInterface[] = [];
  
    // Find the output node
    const outputNode = this.nodes.find((n) => n.type === 'Display');
  
    if (outputNode) {
      setNextVarid(0);
      let nextSamplerId = 0;
  
      outputNode.priority = 0;
  
      // Output the instructions.
      let stack: GraphNodeInterface[] = [outputNode];
  
      while (stack.length > 0) {
        const node = stack[0];
        stack = stack.slice(1)
  
        if (isPropertyNode(node)) {
          // If we have not added this property to the properties array
          // then add it.
          if (!properties.some((p) => p === node.property)) {
            properties.push(node.property);
          }
        }
        else {
          // For SamplerTexure nodes, find the property in the property list
          // that matches its sampler descriptor. If one is not found then
          // create a property for that sampler descriptor.
          if (node.type === 'SampleTexture') {
            const sampleTexture = (node as SampleTexture);
            const sampler = properties.find((p) => (
              p.value.dataType === 'sampler'
              && JSON.stringify(p.value.value) === JSON.stringify(sampleTexture.settings)
            ))
  
            if (sampler) {
              sampleTexture.samplerName = sampler.name;
            }
            else {
              // Property was not found. Create a new property and add it to the
              // property binding list.
              const prop = new Property(`sampler${nextSamplerId}`, 'sampler', sampleTexture.settings);
              nextSamplerId += 1;
              properties.push(prop);
              sampleTexture.samplerName = prop.name;
            }
          }
  
          // Push the input nodes onto the stack
          // and generate variables.
          for (const input of node.inputPorts) {
            if (input.edge) {
              // The node priority is used to determine the order of the
              // node operations during the output phase.
              // Update the node priority if it is lower than 
              // the current node's priority plus 1.
              if (input.edge.output.node.priority ?? 0 < (node.priority ?? 0) + 1) {
                input.edge.output.node.priority = (node.priority ?? 0) + 1;
              }
  
              stack.push(input.edge.output.node);
            }
            else if (
              editMode &&
              input.value !== undefined &&
              input.dataType !== 'uv' &&
              !properties.some((p) => p.name === input.constantName)
            ) {
              properties.push({ name: input.constantName, value: input.value, builtin: false });
            }
          }
        }
      }
    }
  
    // Generate the code
  
    // Only consider nodes that have had their priority set and
    // output their operations in priority order.
    const visitedNodes = this.nodes.filter((n) => n.priority !== null);
    visitedNodes.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  
    let body = '';
  
    for (const node of visitedNodes) {
      const text = node.output(editMode);
      body = text.concat(body);
    }
  
    return [body, properties];
  }
}

export default StageGraph;
