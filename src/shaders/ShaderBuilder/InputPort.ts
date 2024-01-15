import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, Type } from "./Types";

class InputPort implements InputPortInterface {
  node: GraphNodeInterface;

  type: Type;

  name: string;

  edge: GraphEdgeInterface | null = null;

  constructor(node: GraphNodeInterface, type: Type, name: string) {
    this.node = node;
    this.type = type;
    this.name = name;
  }

  getVarname(): string {
    return this.edge?.getVarName() ?? '';
  }
}

export default InputPort;
