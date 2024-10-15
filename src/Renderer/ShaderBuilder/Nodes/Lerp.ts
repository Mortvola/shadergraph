import type { DataType, GraphNodeDescriptor } from '../GraphDescriptor';
import OperationNode from '../OperationNode';
import InputPort from '../Ports/InputPort';
import OutputPort from '../Ports/OutputPort';

class Lerp extends OperationNode {
  constructor(nodeDesriptor?: GraphNodeDescriptor) {
    super('Lerp', 'Lerp', nodeDesriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'A'),
      new InputPort(this, 'vec4f', 'B'),
      new InputPort(this, 'vec4f', 'T'),
    ];

    this.outputPort = [new OutputPort(this, 'vec4f', 'result')]
  }

  getDataType(): DataType {
    const typeA = this.inputPorts[0].getDataType()

    return typeA;
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [varA, dataTypeA] = this.inputPorts[0].getValue(editMode);
    const [varB] = this.inputPorts[1].getValue(editMode);
    const [varT] = this.inputPorts[2].getValue(editMode);

    return [`mix(${varA}, ${varB}, ${varT})`, dataTypeA];
  }
}

export default Lerp;
