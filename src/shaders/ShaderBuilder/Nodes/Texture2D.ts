import PropertyNode from "../PropertyNode";

class Texture2D extends PropertyNode {
  constructor(id?: number) {
    super('texture2D', 'texture2D', '', id)

    this.outputPort.varName = 'ourTexture';
  }
}

export default Texture2D;
