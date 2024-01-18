import InputPort from "./Ports/InputPort";
import OutputPort from "./Ports/OutputPort";
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
    return this.output.getVarName() ?? '';
  }

  setVarName(name: string): void {
    this.output.node.setVarName(name);
  }
}

export default GraphEdge;

