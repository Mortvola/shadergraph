import { GraphStageDescriptor } from "./GraphDescriptor";
import { setNextVarid } from "./GraphNode";
import SampleTexture from "./Nodes/SampleTexture";
import Property from "./Property";
import { GraphEdgeInterface, GraphNodeInterface, isPropertyNode, PropertyInterface } from "./Types";

class StageGraph {
  nodes: GraphNodeInterface[] = [];

  edges: GraphEdgeInterface[] = [];

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
