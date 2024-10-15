import { runInAction } from "mobx";
import type { TextureInterface } from "../../State/types";
import ProjectItem from "./ProjectItem";
import type { FolderInterface} from "./types";
import { ProjectItemType } from "./types";
import { textureManager } from "../../Renderer/Textures/TextureManager";

class TextureProjectItem extends ProjectItem<TextureInterface> {
  constructor(id: number, name: string, parent: FolderInterface | null, itemId: number | null) {
    super(id, name, ProjectItemType.Texture, parent, itemId);
  }

  async getItem(): Promise<TextureInterface | null> {
    if (this.item) {
      return this.item;
    }

    if (this.itemId !== null) {
      const texture = await textureManager.get(this.itemId)

      if (texture) {
  
        runInAction(() => {
          this.item = texture;
        })
  
        return texture
      }  
    }

    return null;
  }
}

export default TextureProjectItem;
