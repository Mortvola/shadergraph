import type { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class TileAndScroll extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('TileAndScroll', 'TileAndScroll', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'uv', 'uv'),
      new InputPort(this, 'vec2f', 'tile'),
      new InputPort(this, 'vec2f', 'scroll'),
    ];

    this.outputPort = [new OutputPort(this, 'vec2f', 'result')]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [uv] = this.inputPorts[0].getValue(editMode);
    const [tile] = this.inputPorts[1].getValue(editMode);
    const [scroll] = this.inputPorts[2].getValue(editMode);

    return [`(${uv}) * (${tile}) + ${scroll}`, 'vec2f']
  }
}

export default TileAndScroll;
