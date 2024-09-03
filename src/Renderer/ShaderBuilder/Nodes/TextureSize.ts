import { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";

class TextureSize extends OperationNode {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('TextureSize', 'TextureSize', nodeDescriptor?.id)

    this.inputPorts = [
      new InputPort(this, 'texture2D', 'texture'),
    ];

    this.outputPort = [
      new OutputPort(this, 'vec2f', 'dimensions'),
    ];
  }

  getDataType(): DataType {
    return 'vec2f'
  }
  
  getExpression(editMode: boolean): [string, DataType] {
    const [texture] = this.inputPorts[0].getValue(editMode);
    return [`vec2f(textureDimensions(${texture}))`, 'vec2f'];
  }
}

export default TextureSize;
