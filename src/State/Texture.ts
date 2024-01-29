import Entity from "./Entity";
import { TextureInterface } from "./types";

class Texture extends Entity implements TextureInterface {
  flipY: boolean;

  constructor(id: number, name: string, flipY: boolean) {
    super(id, name)

    this.flipY = flipY;
  }
}

export default Texture;
