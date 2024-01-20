import { makeObservable, observable, runInAction } from "mobx";
import { GraphNodeInterface, NodeType } from "./Types";
import InputPort from "./Ports/InputPort";
import OutputPort from "./Ports/OutputPort";

class GraphNode implements GraphNodeInterface {
  type: NodeType;

  id: number;

  inputPorts: InputPort[] = [];

  outputPort: OutputPort[] = [];

  private outputVarName: string | null = null;

  x = 0;
  
  y = 0;

  priority: number | null = null;

  constructor(type: NodeType, id?: number) {
    this.type = type;
    this.id = id ?? GraphNode.getNextNodeId();

    if (this.id >= GraphNode.nextNodeId) {
      GraphNode.nextNodeId = this.id + 1;
    }

    makeObservable(this, {
      x: observable,
      y: observable,
    });
  }

  getNumOutputEdges(): number {
    const numEdges = this.outputPort.reduce((count, p) => (
      count + p.edges.length
      ), 0)

    return numEdges;
  }

  getVarName(): string | null {
    return this.outputVarName;
  }

  setVarName(name: string) {
    this.outputVarName = name;
  }

  getName(): string {
    return '';
  }

  getExpression(): string {
    return '';
  }

  getValue(): string {
    if (this.getNumOutputEdges() > 1) {
      return this.getVarName() ?? '';
    }

    return this.getExpression();
  }

  output(): string { 
    if (this.getNumOutputEdges() <= 1) {
      return '';
    }

    return `var ${this.getVarName()} = ${this.getExpression()};\n`;
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
