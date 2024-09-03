import type { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class FWidth extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('FWidth', 'FWidth', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'input'),
    ];

    this.outputPort = [new OutputPort(this, 'vec2f', 'result')]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [value, dataType] = this.inputPorts[0].getValue(editMode);

    return [`fwidth(${value})`, dataType];
  }
}

export default FWidth;
