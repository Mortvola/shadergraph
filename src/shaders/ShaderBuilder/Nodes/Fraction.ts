import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class Fraction extends OperationNode {
  constructor(id?: number) {
    super('Fraction', 'Fraction', id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'input'),
    ];

    this.outputPort = [new OutputPort(this, 'vec2f', 'result')]
  }

  output(): string {
    const varA = this.inputPorts[0].getVarName();
    const varB = this.getVarName();

    return `var ${varB} = fract(${varA});\n`;
  }

}

export default Fraction;
