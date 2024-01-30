import { makeObservable, observable, runInAction } from "mobx";
import ProjectItem from "./ProjectItem";
import { FolderInterface, ProjectItemInterface, isFolder } from "./types";
import Http from "../../Http/src";

class Folder extends ProjectItem implements FolderInterface {
  items: ProjectItemInterface[] = []

  constructor(id: number, name: string, parent: FolderInterface | null) {
    super(id, name, 'folder', parent, null)

    makeObservable(this, {
      items: observable,
    })
  }

  isAncestor(item: ProjectItemInterface): boolean {
    if (isFolder(item)) {
      let child: FolderInterface | null = this;
      for (;;) {
        if (child === null || child.parent === item) {
          break;
        }

        child = child.parent;
      }

      if (child) {
        return true;
      }
    }

    return false;
  }

  async addItem(item: ProjectItemInterface): Promise<void> {
    if (this.isAncestor(item)) {
      throw new Error('item is an ancestor of the destination')
    }

    const response = await Http.patch(`/folders/${item.id}`, {
      parentId: this.id === -1 ? null : this.id,
    })

    if (response.ok) {
      runInAction(() => {
        this.items = this.items.concat([item]);
        this.items.sort((a, b) => a.name.localeCompare(b.name))
        item.parent = this;
      })
    }
  }

  addItems(items: ProjectItemInterface[]): void {
    runInAction(() => {
      this.items = items;

      for (const item of this.items) {
        item.parent = this;
      }
    })
  }

  async removeItem(item: ProjectItemInterface): Promise<void> {
    const response = await Http.patch(`/folders/${item.id}`, {
      parentId: null,
    })

    if (response.ok) {
      runInAction(() => {
        const index = this.items.findIndex((i) => i.id === item.id)
  
        if (index !== -1) {
          // Remove from the parent.
          this.items = [
            ...this.items.slice(0, index),
            ...this.items.slice(index + 1)
          ]
  
          item.parent = null;
        }
      })  
    }
  }

  async deleteItem(item: ProjectItemInterface) {
    const response = await Http.delete(`/folders/${item.id}`)

    if (response.ok) {
      runInAction(() => {
        const index = this.items.findIndex((i) => i.id === item.id)
  
        if (index !== -1) {
          // Remove from the parent.
          this.items = [
            ...this.items.slice(0, index),
            ...this.items.slice(index + 1)
          ]
  
          item.parent = null;
        }
      })  
    }
  }
}

export default Folder;
