import { makeObservable, observable, runInAction } from "mobx";
import Http from "../../Http/src";
import { GameObjectInterface } from "../../State/types";
import { FolderInterface, ProjectItemInterface } from "./types";

class ProjectItem implements ProjectItemInterface {
  id: number

  name: string

  type: string

  itemId: number | null

  parent: FolderInterface | null = null;

  item: GameObjectInterface | null = null;

  constructor(id: number, name: string, type: string, parent: FolderInterface | null, itemId: number | null) {
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

  async changeName(name: string): Promise<void> {
    const response = await Http.patch(`/folders/${this.id}`, {
      name,
    })

    if (response) {
      runInAction(() => {
        this.name = name;
      })
    }
  }

  async delete(): Promise<void> {
    return this.parent?.deleteItem(this);
  }

  getItem<T>(): T | null {
    if (!this.item) {
      return null
    }

    return this.item as T
  }
}

export default ProjectItem;
