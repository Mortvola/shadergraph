import type { DataType, GraphNodeDescriptor } from '../GraphDescriptor';
import OperationNode from '../OperationNode';
import InputPort from '../Ports/InputPort';
import OutputPort from '../Ports/OutputPort';

class Twirl extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Twirl', 'Twirl', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'uv', 'uv'),
      new InputPort(this, 'float', 'strength'),
      new InputPort(this, 'vec2f', 'offset'),
    ];

    this.outputPort = [
      new OutputPort(this, 'vec2f', 'uv'),
    ]
  }

  getDataType(): DataType {
    return 'vec2f'
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [uv] = this.inputPorts[0].getValue(editMode);
    const [strength] = this.inputPorts[1].getValue(editMode);
    const [offset] = this.inputPorts[2].getValue(editMode);

    return [`twirl(${uv}, ${strength}, ${offset})`, 'vec2f'];
  }
}

export default Twirl;
