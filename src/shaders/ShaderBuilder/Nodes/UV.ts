import OutputPort from "../Ports/OutputPort";
import PropertyNode from "../PropertyNode";

class UV extends PropertyNode {
  constructor(id?: number) {
    super('uv', 'vec2f', 'UV', id)

    this.outputPort = [new OutputPort(this, 'vec2f', 'uv')];
    this.outputVarName = 'vertexOut.texcoord';

    this.readonly = true;
  }
}

export default UV;
