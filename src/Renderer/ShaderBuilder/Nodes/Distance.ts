import { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class Distance extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Distance', 'Distance', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec2f', 'A'),
      new InputPort(this, 'vec2f', 'B'),
    ];

    this.outputPort = [new OutputPort(this, 'float', 'result')]
  }

  getDataType(): DataType {
    return 'float'
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [varA] = this.inputPorts[0].getValue(editMode);
    const [varB] = this.inputPorts[1].getValue(editMode);

    return [`distance(${varA}, ${varB})`, 'float'];
  }
}

export default Distance;
