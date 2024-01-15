import { makeObservable, observable, runInAction } from "mobx";
import { GraphNodeInterface, NodeType } from "./Types";

class GraphNode implements GraphNodeInterface {
  name: string;

  type: NodeType;

  id: number;

  x = 0;
  
  y = 0;

  constructor(type: NodeType, name: string, id?: number) {
    this.type = type;
    this.name = name;
    this.id = id ?? GraphNode.getNextNodeId();

    makeObservable(this, {
      x: observable,
      y: observable,
    });
  }

  static nextNodeId = 0;

  static getNextNodeId(): number {
    GraphNode.nextNodeId += 1;

    return this.nextNodeId;
  }

  setPosition(x: number, y: number): void {
    runInAction(() => {
      this.x = x;
      this.y = y;
    })
  }
}

export default GraphNode;
