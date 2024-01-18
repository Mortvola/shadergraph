import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";

class Display extends OperationNode {
  constructor(id?: number) {
    super('display', 'Display', id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'rgb'),
      new InputPort(this, 'float', 'a'),
    ]
  }

  output(): string {
    if (this.inputPorts[1].edge) {
      return `return vec4f(${this.inputPorts[0].getVarname()}.rgb, ${this.inputPorts[1].getVarname()});`;
    }

    return `return ${this.inputPorts[0].getVarname()};`;
  }
}

export default Display;
