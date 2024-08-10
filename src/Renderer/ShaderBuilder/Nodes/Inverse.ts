import { GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";
import { DataType } from "../Types";

class Inverse extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Inverse', 'Inverse', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'Value'),
    ];

    this.outputPort = [new OutputPort(this, 'vec2f', 'result')]
  }

  getDataType(): DataType {
    return this.inputPorts[0].getDataType()
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [varA, dataTypeA] = this.inputPorts[0].getValue(editMode);

    return [`1 / (${varA})`, dataTypeA];
  }
}

export default Inverse;
