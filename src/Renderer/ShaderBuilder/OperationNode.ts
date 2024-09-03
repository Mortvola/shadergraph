import { NodeType } from "./GraphDescriptor";
import GraphNode from "./GraphNode";

class OperationNode extends GraphNode {
  name: string;

  constructor(type: NodeType, name: string, id?: number) {
    super(type, id);

    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}

export default OperationNode;
