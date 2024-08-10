import BuiltIn from "../BuiltInNode";
import { GraphNodeDescriptor } from "../GraphDescriptor";
import OutputPort from "../Ports/OutputPort";

class VertexColor extends BuiltIn {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('VertexColor', 'Vertex Color', false, nodeDescriptor?.id)

    this.outputPort = [new OutputPort(this, 'vec4f', 'out')];
    this.setVarName('vertexOut.color');
  }

  setVarName(varName: string | null): void {
    super.setVarName('vertexOut.color');
  }
}

export default VertexColor;
