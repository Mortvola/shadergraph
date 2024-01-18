import OutputPort from "../Ports/OutputPort";
import Value from "../Value";
import ValueNode from "../ValueNode";

class Vector2D extends ValueNode {
  constructor(id?: number) {
    super(new Value('vec2f', [0, 0]), id)

    this.outputPort = [new OutputPort(this, 'vec2f', 'vector2D')];
  }
}

export default Vector2D;
