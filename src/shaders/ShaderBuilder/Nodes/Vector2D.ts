import OutputPort from "../OutputPort";
import PropertyNode from "../PropertyNode";

class Vector2D extends PropertyNode {
  constructor(id?: number) {
    super('vector2D', 'vec2f', [0, 0], id)

    this.outputPort = new OutputPort(this, 'vec2f', 'vector2D');
  }
}

export default Vector2D;
