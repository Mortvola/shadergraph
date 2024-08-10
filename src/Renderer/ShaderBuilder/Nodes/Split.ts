import { GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import AlphaPort from "../Ports/AlphaPort";
import BluePort from "../Ports/BluePort";
import GreenPort from "../Ports/GreenPort";
import InputPort from "../Ports/InputPort";
import RedPort from "../Ports/RedPort";
import { DataType } from "../Types";

class Split extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Split', 'Split', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'input'),
    ];

    this.outputPort = [
      new RedPort(this, 'float', 'r'),
      new GreenPort(this, 'float', 'g'),
      new BluePort(this, 'float', 'b'),
      new AlphaPort(this, 'float', 'a'),
    ]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [rgba] = this.inputPorts[0].getValue(editMode);

    return [`${rgba}`, 'vec4f'];
  }
}

export default Split;
