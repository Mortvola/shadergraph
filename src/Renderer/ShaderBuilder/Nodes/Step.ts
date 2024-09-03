import { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class Step extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Step', 'Step', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'A'),
      new InputPort(this, 'float', 'B'),
    ];

    this.outputPort = [new OutputPort(this, 'vec4f', 'result')]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [varA, dataTypeA] = this.inputPorts[0].getValue(editMode);
    const [varB] = this.inputPorts[1].getValue(editMode);

    return [`step(${varA}, ${varB})`, dataTypeA];
  }
}

export default Step;
