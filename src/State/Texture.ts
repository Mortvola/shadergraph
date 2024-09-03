import { makeObservable, observable } from "mobx";
import Entity from "./Entity";
import type { TextureInterface } from "./types";

class Texture extends Entity implements TextureInterface {
  flipY: boolean;

  constructor(id: number, name: string, flipY: boolean) {
    super(id, name)

    this.flipY = flipY;

    makeObservable(this, {
      flipY: observable,
    })
  }
}

export default Texture;
