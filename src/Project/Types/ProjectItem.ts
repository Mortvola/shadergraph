import { makeObservable, observable, runInAction } from "mobx";
import Http from "../../Http/src";
import { FolderInterface, ProjectItemInterface, ProjectItemLike, ProjectItemType } from "./types";
import { particleSystemManager } from "../../Renderer/ParticleSystem/ParticleSystemManager";

class ProjectItem<T> implements ProjectItemInterface<T> {
  id: number

  name: string

  type: ProjectItemType

  itemId: number | null

  parent: FolderInterface | null = null;

  item: T | null = null;

  constructor(id: number, name: string, type: ProjectItemType, parent: FolderInterface | null, itemId: number | null) {
    this.id = id;
    this.itemId = itemId
    this.parent = parent
    this.name = name;
    this.type = type;

    makeObservable(this, {
      name: observable,
      item: observable,
    })
  }

  async changeName(name: string): Promise<boolean> {
    if (name !== this.name) {
      const response = await Http.patch(`/api/folders/${this.id}`, {
        name,
      })
  
      if (response) {
        runInAction(() => {
          this.name = name;
        })
      }

      return true;
    }

    return false;
  }

  async delete(): Promise<void> {
    return this.parent?.deleteItem(this as ProjectItemLike);
  }

  async getItem(): Promise<T | null> {
    let item: T | null = this.item as (T | null);

    if (!item) {
      switch (this.type) {    
        case 'particle': {
          const particleSystem = await particleSystemManager.getParticleSystem(this.itemId!)
  
          if (particleSystem) {
            item = particleSystem as T;

            runInAction(() => {
              this.item = item
            })  
          }
      
          break;
        }
      }
    }

    return item
  }
}

export default ProjectItem;
