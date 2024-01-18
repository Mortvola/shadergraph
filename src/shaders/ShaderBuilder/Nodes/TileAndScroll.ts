import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class TileAndScroll extends OperationNode {
  constructor(id?: number) {
    super('TileAndScroll', 'TileAndScroll', id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'uv'),
      new InputPort(this, 'vec2f', 'tile'),
      new InputPort(this, 'vec2f', 'scroll'),
    ];

    this.outputPort = [new OutputPort(this, 'vec2f', 'result')]
  }

  output(): string {
    const uv = this.inputPorts[0].getVarname();
    const tile = this.inputPorts[1].getVarname();
    const scroll = this.inputPorts[2].getVarname();
    const result = this.getVarName();

    return `var ${result} = fract(${uv} * ${tile} + ${scroll});\n`
  }
}

export default TileAndScroll;
