import { runInAction } from "mobx";
import Http from "../../Http/src";
import Prefab from "../../Scene/Types/Prefab";
import { PrefabDescriptor, PrefabInterface } from "../../State/types";
import ProjectItem from "./ProjectItem";
import { FolderInterface, ProjectItemType } from "./types";

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
      const response = await Http.get<PrefabDescriptor>(`/prefabs/${this.itemId}`);
    
      if (response.ok) {
        const body = await response.body();
  
        const prefab = await Prefab.fromDescriptor(body);
  
        if (prefab) {
          prefab.id = this.itemId;
  
          runInAction(() => {
            this.item = prefab;
          })
  
          return prefab;
        }
      }  
    }

    return null;
  }
}

export default PrefabProjectItem;
