import { makeObservable, observable, runInAction } from "mobx";
import { GraphNodeInterface, NodeType } from "./Types";
import InputPort from "./Ports/InputPort";
import OutputPort from "./Ports/OutputPort";

class GraphNode implements GraphNodeInterface {
  name: string;

  type: NodeType;

  id: number;

  inputPorts: InputPort[] = [];

  outputPort: OutputPort[] = [];

  outputVarName: string | null = null;

  x = 0;
  
  y = 0;

  priority: number | null = null;

  constructor(type: NodeType, name: string, id?: number) {
    this.type = type;
    this.name = name;
    this.id = id ?? GraphNode.getNextNodeId();

    if (this.id >= GraphNode.nextNodeId) {
      GraphNode.nextNodeId = this.id + 1;
    }

    makeObservable(this, {
      x: observable,
      y: observable,
    });
  }

  output(): string { 
    return '';   
  }

  static nextNodeId = 0;

  static getNextNodeId(): number {
    GraphNode.nextNodeId += 1;

    return GraphNode.nextNodeId;
  }

  setPosition(x: number, y: number): void {
    runInAction(() => {
      this.x = x;
      this.y = y;
    })
  }
}

export default GraphNode;
