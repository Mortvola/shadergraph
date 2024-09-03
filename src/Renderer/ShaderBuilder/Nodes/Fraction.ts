import { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class Fraction extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Fraction', 'Fraction', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'input'),
    ];

    this.outputPort = [new OutputPort(this, 'vec2f', 'result')]
  }

  getDataType(): DataType {
    return this.inputPorts[0].getDataType()
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [value, dataType] = this.inputPorts[0].getValue(editMode);

    return [`fract(${value})`, dataType];
  }
}

export default Fraction;
