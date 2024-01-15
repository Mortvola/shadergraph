import InputPort from "../InputPort";
import OperationNode from "../OperationNode";
import OutputPort from "../OutputPort";

class Multiply extends OperationNode {
  constructor(id: number) {
    super('Multiply', id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'A'),
      new InputPort(this, 'vec2f', 'B'),
    ];

    this.outputPort = new OutputPort(this, 'vec2f', 'result')
  }

  output(): string {
    const varA = this.inputPorts[0].getVarname();
    const varB = this.inputPorts[1].getVarname();
    const varC = this.outputPort?.varName;

    return `var ${varC} = ${varA} * ${varB};\n`;
  }
}

export default Multiply;
