import GraphNode from "./GraphNode";
import { NodeType } from "./Types";

class BuiltIn extends GraphNode {
  name: string;

  constructor(type: NodeType, name: string, id?: number) {
    super(type, id)

    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}

export default BuiltIn;
