import { observable } from 'mobx';
import Entity from '../../State/Entity';
import type { TextureInterface } from '../../State/types';

class Texture extends Entity implements TextureInterface {
  @observable
  accessor flipY: boolean;

  texture: GPUTexture;

  constructor(id: number, name: string, flipY: boolean, texture: GPUTexture) {
    super(id, name)

    this.flipY = flipY;

    this.texture = texture;
  }
}

export default Texture;
