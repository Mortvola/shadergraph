import type { DataType, GraphNodeDescriptor } from '../GraphDescriptor';
import OperationNode from '../OperationNode';
import InputPort from '../Ports/InputPort';
import OutputPort from '../Ports/OutputPort';

class Clamp extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Clamp', 'Clamp', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'A'),
      new InputPort(this, 'vec4f', 'B'),
      new InputPort(this, 'vec4f', 'C'),
    ];

    this.outputPort = [new OutputPort(this, 'vec4f', 'result')]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [varA, dataTypeA] = this.inputPorts[0].getValue(editMode);
    const [varB] = this.inputPorts[1].getValue(editMode);
    const [varC] = this.inputPorts[2].getValue(editMode);

    return [`clamp(${varA}, ${varB}, ${varC})`, dataTypeA];
  }
}

export default Clamp;
