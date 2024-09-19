import { runInAction } from "mobx";
import type { PrefabInterface } from "../../Scene/Types/Types";
import ProjectItem from "./ProjectItem";
import type { FolderInterface} from "./types";
import { ProjectItemType } from "./types";
// import { prefabManager } from "../../Scene/Types/PrefabManager";

class PrefabProjectItem extends ProjectItem<PrefabInterface> {
  constructor(id: number, name: string, parent: FolderInterface | null, itemId: number | null) {
    super(id, name, ProjectItemType.Prefab, parent, itemId);
  }

  async changeName(name: string): Promise<boolean> {
    const changed = await super.changeName(name);

    if (changed) {
      runInAction(() => {
        if (this.item?.root) {
          this.item.root.name = name;
        }  
      })

      return true;
    }

    return false;
  }

  async getItem(): Promise<PrefabInterface | null> {
    if (this.item) {
      return this.item;
    }

    if (this.itemId) {
      // const prefab = await prefabManager.get(this.itemId)
  
      // if (prefab) {
      //   prefab.id = this.itemId;

      //   runInAction(() => {
      //     this.item = prefab;
      //   })

      //   return prefab;
      // }
    }

    return null;
  }
}

export default PrefabProjectItem;
