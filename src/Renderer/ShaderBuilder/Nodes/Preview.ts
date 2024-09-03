import { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";

class Preview extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Preview', 'Preview', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'rgba'),
    ]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [varA, dataType] = this.inputPorts[0].getValue(editMode);

    if (dataType === 'float') {
      return [`vec4f(${varA}, 0.0, 0.0, 1.0)`, 'vec4f'];
    }

    if (dataType === 'vec2f') {
      return [`vec4f(${varA}, 0.0, 1.0)`, 'vec4f'];
    }

    if (dataType === 'vec3f') {
      return [`vec4f(${varA}, 1.0)`, 'vec4f'];
    }

    return [`${varA}`, 'vec4f'];
  }

  output(editMode: boolean): string {
    const [value] = this.getExpression(editMode)

    return `var fragOut = ${value};`;
  }
}

export default Preview;
