import type { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";
import { convertType } from '../Types'

class Min extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Min', 'Min', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'A'),
      new InputPort(this, 'vec2f', 'B'),
    ];

    this.outputPort = [new OutputPort(this, 'vec2f', 'result')]
  }

  getDataType(): DataType {
    const typeA = this.inputPorts[0].getDataType()
    const typeB = this.inputPorts[1].getDataType()

    if (typeA === 'float') {
      return typeB
    }

    if (typeB === 'float') {
      return typeA
    }

    if (convertType(typeA) === convertType(typeB)) {
      return typeA;
    }

    return 'vec2f'
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [varA, dataTypeA] = this.inputPorts[0].getValue(editMode);
    const [varB] = this.inputPorts[1].getValue(editMode);

    return [`min(${varA}, ${varB})`, dataTypeA];
  }
}

export default Min;
