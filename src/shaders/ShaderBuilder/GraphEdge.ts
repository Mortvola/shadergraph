import GraphNode from "./GraphNode";
import InputPort from "./InputPort";
import OutputPort from "./OutputPort";
import { GraphEdgeInterface } from "./Types";

class GraphEdge implements GraphEdgeInterface {
  output: OutputPort;

  input: InputPort;

  constructor(outputPort: OutputPort, inputPort: InputPort) {
    this.output = outputPort;
    outputPort.edge = this;

    this.input = inputPort;
    inputPort.edge = this;
  }

  getVarName(): string {
    return this.output.varName ?? '';
  }

  setVarName(name: string) {
    this.output.varName = name;
  }
}

export default GraphEdge;

