import type { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";
import RGBPort from "../Ports/RGBPort";

class Combine extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Combine', 'Combine', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'float', 'r'),
      new InputPort(this, 'float', 'g'),
      new InputPort(this, 'float', 'b'),
      new InputPort(this, 'float', 'a'),
    ];

    this.outputPort = [
      new OutputPort(this, 'vec4f', 'rgba'),
      new RGBPort(this, 'vec3f', 'rgb'),
    ]
  }

  getDataType(): DataType {
    return 'vec4f';
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [r] = this.inputPorts[0].getValue(editMode);
    const [g] = this.inputPorts[1].getValue(editMode);
    const [b] = this.inputPorts[2].getValue(editMode);
    const [a] = this.inputPorts[3].getValue(editMode);

    return [`vec4f(${r}, ${g}, ${b}, ${a})`, 'vec4f'];
  }
}

export default Combine;
