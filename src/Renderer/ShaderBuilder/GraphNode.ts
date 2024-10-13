import { makeObservable, observable, runInAction } from "mobx";
import type { GraphNodeInterface } from "./Types";
import type InputPort from "./Ports/InputPort";
import type OutputPort from "./Ports/OutputPort";
import type { DataType, GraphNodeDescriptor, NodeType } from "./GraphDescriptor";
import GraphNotification from "./GraphNotification";

export let nextVarId = 0;

export const setNextVarid = (id: number) => {
  nextVarId = id;
}

const generatVarName = () => {
  const varName = `v${nextVarId}`
  nextVarId += 1;
  return varName;
}

class GraphNode implements GraphNodeInterface {
  type: NodeType;

  id: number;

  inputPorts: InputPort[] = [];

  outputPort: OutputPort[] = [];

  private outputVarName: string | null = null;

  position: { x: number, y: number };

  priority: number | null = null;

  constructor(type: NodeType, id?: number) {
    this.type = type;
    this.id = id ?? GraphNode.getNextNodeId();

    this.position = { x: 0, y: 0};
    
    if (this.id >= GraphNode.nextNodeId) {
      GraphNode.nextNodeId = this.id + 1;
    }

    makeObservable(this, {
      position: observable,
    });
  }

  createDescriptor(): GraphNodeDescriptor {
    return ({
      id: this.id,
      type: this.type,
      x: this.position?.x,
      y: this.position?.y,
      portValues: this.inputPorts
        .filter((p) => !p.edge && p.value)
        .map((p) => ({ port: p.name, value: p.value!.value })),
    })
  }

  getNumOutputEdges(): number {
    const numEdges = this.outputPort.reduce((count, p) => (
      count + p.edges.length
      ), 0)

    return numEdges;
  }

  getDataType(): DataType {
    return 'float'
  }

  getVarName(): [string, DataType] {
    if (this.outputVarName === null) {
      this.outputVarName = generatVarName();
    }

    return [this.outputVarName, this.getDataType()];
  }

  setVarName(name: string | null) {
    this.outputVarName = name;
  }

  getName(): string {
    return '';
  }

  getExpression(editMode: boolean): [string, DataType] {
    return ['', this.getDataType()];
  }

  getValue(editMode: boolean): [string, DataType] {
    // If there is more than one edge that references this node
    // then output the variable name instead of the expression.
    if (this.getNumOutputEdges() > 1) {
      return this.getVarName() ?? ['', 'float'];
    }

    return this.getExpression(editMode);
  }

  output(editMode: boolean): string { 
    if (this.getNumOutputEdges() <= 1) {
      return '';
    }

    const [lhs] = this.getVarName();
    const [rhs] = this.getExpression(editMode);

    return `var ${lhs} = ${rhs};\n`;
  }

  static nextNodeId = 0;

  static getNextNodeId(): number {
    GraphNode.nextNodeId += 1;

    return GraphNode.nextNodeId;
  }

  setPosition(x: number, y: number): void {
    runInAction(() => {
      this.position = { x, y }
    })
  }

  notify(notification?: GraphNotification) {
    let n = notification;
    if (n === undefined) {
      n = new GraphNotification()
    }

    if (!n.visited.has(this.id)) {
      n.visited.add(this.id)
      this.notifyOutputs(n)
    }
  }

  private notifyOutputs(notification: GraphNotification) {
    for (const output of this.outputPort) {
      for (const edge of output.edges) {
        edge.input.node.notify(notification);
      }
    }
  }
}

export default GraphNode;
