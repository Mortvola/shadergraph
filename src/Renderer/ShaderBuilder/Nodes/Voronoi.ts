import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";
import { DataType } from "../Types";

class Voronoi extends OperationNode {
  constructor(id?: number) {
    super('Voronoi', 'Voronoi', id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'uv'),
      new InputPort(this, 'float', 'density'),
    ];

    this.outputPort = [
      new OutputPort(this, 'float', 'result'),
    ]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [uv] = this.inputPorts[0].getValue(editMode);
    const [density] = this.inputPorts[1].getValue(editMode);

    return [`voronoi(${uv}, ${density})`, 'float'];
  }
}

export default Voronoi;
