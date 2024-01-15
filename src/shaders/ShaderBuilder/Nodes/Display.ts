import InputPort from "../InputPort";
import OperationNode from "../OperationNode";

class Display extends OperationNode {
  constructor(id: number) {
    super('display', id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'fragment'),
    ]
  }

  output(): string {
    return `return ${this.inputPorts[0].getVarname()};`;
  }
}

export default Display;
