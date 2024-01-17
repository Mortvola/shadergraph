import OutputPort from "../OutputPort";
import PropertyNode from "../PropertyNode";

class UV extends PropertyNode {
  constructor(id?: number) {
    super('uv', 'vec2f', 'UV', id)

    this.outputPort = new OutputPort(this, 'vec2f', 'uv');
    this.outputPort.varName = 'vertexOut.texcoord';

    this.readonly = true;
  }
}

export default UV;
