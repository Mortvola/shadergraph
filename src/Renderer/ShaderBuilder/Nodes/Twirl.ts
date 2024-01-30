import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class Twirl extends OperationNode {
  constructor(id?: number) {
    super('Twirl', 'Twirl', id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'uv'),
      new InputPort(this, 'float', 'strength'),
      new InputPort(this, 'vec2f', 'offset'),
    ];

    this.outputPort = [
      new OutputPort(this, 'vec2f', 'uv'),
    ]
  }

  getExpression(): string {
    const uv = this.inputPorts[0].getValue();
    const strength = this.inputPorts[1].getValue();
    const offset = this.inputPorts[2].getValue();

    return `twirl(${uv}, ${strength}, ${offset})`;
  }
}

export default Twirl;