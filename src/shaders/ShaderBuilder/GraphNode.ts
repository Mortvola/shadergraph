import { GraphNodeInterface, NodeType } from "./Types";

class GraphNode implements GraphNodeInterface {
  type: NodeType;
  id: number;

  constructor(type: NodeType, id?: number) {
    this.type = type;
    this.id = id ?? GraphNode.getNextNodeId();
  }

  static nextNodeId = 0;

  static getNextNodeId(): number {
    GraphNode.nextNodeId += 1;

    return this.nextNodeId;
  }
}

export default GraphNode;
