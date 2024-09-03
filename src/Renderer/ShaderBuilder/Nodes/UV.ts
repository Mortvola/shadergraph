import BuiltIn from "../BuiltInNode";
import { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OutputPort from "../Ports/OutputPort";

class UV extends BuiltIn {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('UV', 'UV', false, nodeDescriptor?.id)

    this.outputPort = [new OutputPort(this, 'vec2f', 'uv')];
    this.setVarName('vertexOut.texcoord');
  }

  setVarName(varName: string | null): void {
    super.setVarName('vertexOut.texcoord')
  }

  getDataType(): DataType {
    return 'vec2f'
  }
}

export default UV;
