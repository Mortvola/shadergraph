import type { DataType, GraphNodeDescriptor, SamplerDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import AlphaPort from "../Ports/AlphaPort";
import BluePort from "../Ports/BluePort";
import GreenPort from "../Ports/GreenPort";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";
import RedPort from "../Ports/RedPort";

class PhongShading extends OperationNode {
  sampler: SamplerDescriptor = {};

  samplerName: string | null = null;

  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('PhongShading', 'Phong Shading', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'rgba'),
    ];

    this.outputPort = [
      new OutputPort(this, 'vec4f', 'rgba'),
      new RedPort(this, 'float', 'r'),
      new GreenPort(this, 'float', 'g'),
      new BluePort(this, 'float', 'b'),
      new AlphaPort(this, 'float', 'a'),
    ]
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [color] = this.inputPorts[0].getValue(editMode);
    return [color, 'vec4f']
    // return [`blinnPhong(vertexOut.fragPos, vertexOut.normal, ${color})`, 'vec4f'];
  }

  getDataType(): DataType {
    return 'vec4f'
  }
}

export default PhongShading;
