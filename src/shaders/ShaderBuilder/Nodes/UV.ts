import BuiltIn from "../BuiltInNode";
import OutputPort from "../Ports/OutputPort";

class UV extends BuiltIn {
  constructor(id?: number) {
    super('uv', 'UV', id)

    this.outputPort = [new OutputPort(this, 'vec2f', 'uv')];
    this.setVarName('vertexOut.texcoord');
  }
}

export default UV;
