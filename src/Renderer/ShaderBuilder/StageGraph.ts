import { GraphStageDescriptor } from "./GraphDescriptor";
import { GraphEdgeInterface, GraphNodeInterface } from "./Types";

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
}

export default StageGraph;
