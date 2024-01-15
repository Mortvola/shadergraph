import OperationNode from "../OperationNode";
import OutputPort from "../OutputPort";

class UV extends OperationNode {
  constructor(id?: number) {
    super('uv', id)

    this.outputPort = new OutputPort(this, 'vec2f', 'uv');
    this.outputPort.varName = 'vertexOut.texcoord';
  }
}

export default UV;
