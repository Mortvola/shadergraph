import { GraphEdgeInterface, GraphNodeInterface, OutputPortInterface, Type } from "../Types"

class OutputPort implements OutputPortInterface {
  node: GraphNodeInterface;

  type: Type;

  name: string;

  edge: GraphEdgeInterface | null = null;

  offsetX = 0;

  offsetY = 0;
  
  constructor(node: GraphNodeInterface, type: Type, name: string) {
    this.node = node;
    this.type = type;
    this.name = name;
  }

  getVarName(): string {
    return this.node.getVarName() ?? '';
  }
}

export default OutputPort;

