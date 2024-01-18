import Property from "../Property";
import PropertyNode from "../PropertyNode";

class Texture2D extends PropertyNode {
  constructor(name?: string, value?: string, id?: number) {
    super(new Property(name ?? 'texture2D', 'texture2D', value ?? ''), id)
  }
}

export default Texture2D;
