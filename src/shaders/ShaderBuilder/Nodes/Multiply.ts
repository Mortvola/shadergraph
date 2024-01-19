import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class Multiply extends OperationNode {
  constructor(id?: number) {
    super('Multiply', 'Multiply', id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'A'),
      new InputPort(this, 'vec2f', 'B'),
    ];

    this.outputPort = [new OutputPort(this, 'vec2f', 'result')]
  }

  output(): string {
    const varA = this.inputPorts[0].getVarName();
    const varB = this.inputPorts[1].getVarName();
    const varC = this.getVarName();

    return `var ${varC} = ${varA} * ${varB};\n`;
  }
}

export default Multiply;
