import { runInAction } from "mobx";
import Http from "../../Http/src";
import PrefabObject from "../../Scene/Types/PrefabObject";
import { PrefabObjectDescriptor, PrefabObjectInterface } from "../../State/types";
import ProjectItem from "./ProjectItem";
import { FolderInterface, ProjectItemType } from "./types";

class PrefabProjectItem extends ProjectItem<PrefabObjectInterface> {
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

  async getItem(): Promise<PrefabObjectInterface | null> {
    if (this.item) {
      return this.item;
    }

    const response = await Http.get<{ prefab: PrefabObjectDescriptor }>(`/prefabs/${this.itemId}`);
    
    if (response.ok) {
      const body = await response.body();

      const prefab = await PrefabObject.fromDescriptor(body.prefab);

      if (prefab) {
        runInAction(() => {
          this.item = prefab;
        })

        return prefab;
      }
    }

    return null;
  }
}

export default PrefabProjectItem;
