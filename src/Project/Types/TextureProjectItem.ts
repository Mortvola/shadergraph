import { runInAction } from "mobx";
import Http from "../../Http/src";
import Texture from "../../State/Texture";
import type { TextureInterface, TextureRecord } from "../../State/types";
import ProjectItem from "./ProjectItem";
import type { FolderInterface} from "./types";
import { ProjectItemType } from "./types";

class TextureProjectItem extends ProjectItem<TextureInterface> {
  constructor(id: number, name: string, parent: FolderInterface | null, itemId: number | null) {
    super(id, name, ProjectItemType.Texture, parent, itemId);
  }

  async getItem(): Promise<TextureInterface | null> {
    if (this.item) {
      return this.item;
    }

    const response = await Http.get<TextureRecord>(`/api/textures/${this.itemId}`);
  
    if (response.ok) {
      const record = await response.body();

      const texture = new Texture(record.id, record.name, record.flipY);

      runInAction(() => {
        this.item = texture;
      })

      return texture;
    }

    return null;
  }
}

export default TextureProjectItem;
