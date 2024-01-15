import { GraphEdgeInterface, GraphNodeInterface, OutputPortInterface, Type } from "./Types"

class OutputPort implements OutputPortInterface {
  node: GraphNodeInterface;

  type: Type;

  name: string;

  varName: string | null = null;

  edge: GraphEdgeInterface | null = null;

  constructor(node: GraphNodeInterface, type: Type, name: string) {
    this.node = node;
    this.type = type;
    this.name = name;
  }
}

export default OutputPort;

