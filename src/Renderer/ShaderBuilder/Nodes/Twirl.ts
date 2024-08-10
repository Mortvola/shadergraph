import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";
import { DataType } from "../Types";

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

  getExpression(editMode: boolean): [string, DataType] {
    const [uv] = this.inputPorts[0].getValue(editMode);
    const [strength] = this.inputPorts[1].getValue(editMode);
    const [offset] = this.inputPorts[2].getValue(editMode);

    return [`twirl(${uv}, ${strength}, ${offset})`, 'vec2f'];
  }
}

export default Twirl;
