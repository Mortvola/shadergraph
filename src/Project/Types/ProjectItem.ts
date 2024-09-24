import { observable, runInAction } from "mobx";
import Http from "../../Http/src";
import type { FolderInterface, ProjectItemInterface, ProjectItemLike, ProjectItemType } from "./types";

class ProjectItem<T> implements ProjectItemInterface<T> {
  id: number

  @observable
  accessor name: string

  type: ProjectItemType

  itemId: number | null

  parent: FolderInterface | null = null;

  @observable
  accessor item: T | null = null;

  constructor(id: number, name: string, type: ProjectItemType, parent: FolderInterface | null, itemId: number | null) {
    this.id = id;
    this.itemId = itemId
    this.parent = parent
    this.name = name;
    this.type = type;
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
    const item: T | null = this.item as (T | null);

    return item
  }
}

export default ProjectItem;
