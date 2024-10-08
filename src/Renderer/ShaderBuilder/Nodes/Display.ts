import type { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";

class Display extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Display', 'Display', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'rgb'),
      new InputPort(this, 'float', 'a'),
    ]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [alpha] = this.inputPorts[1].getValue(editMode)

    if (this.inputPorts[1].edge) {
      const [varA] = this.inputPorts[0].getValue(editMode)

      return [`vec4f((${varA}).rgb, ${alpha})`, 'vec4f'];
    }

    const [varA, dataType] = this.inputPorts[0].getValue(editMode);

    if (dataType === 'float') {
      return [`vec4f(${varA}, 0, 0, ${alpha})`, 'vec4f'];
    }

    if (dataType === 'vec2f') {
      return [`vec4f(${varA}, 0, ${alpha})`, 'vec4f'];
    }

    if (dataType === 'vec3f') {
      return [`vec4f(${varA}, ${alpha})`, 'vec4f'];
    }

    return [`${varA}`, 'vec4f'];
  }

  output(editMode: boolean): string {
    const [value] = this.getExpression(editMode)

    return `var fragOut = ${value};`;
  }
}

export default Display;
