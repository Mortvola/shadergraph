import { makeObservable, observable, runInAction } from "mobx";
import ProjectItem from "./ProjectItem";
import { FolderInterface, ProjectInterface, ProjectItemInterface, ProjectItemType, isFolder } from "./types";
import Http from "../../Http/src";

class Folder extends ProjectItem implements FolderInterface {
  items: ProjectItemInterface[] = []

  project: ProjectInterface

  newItemType: ProjectItemType | null = null;

  open = true;

  constructor(id: number, name: string, parent: FolderInterface | null, project: ProjectInterface) {
    super(id, name, 'folder', parent, null)

    this.project = project;

    makeObservable(this, {
      items: observable,
      newItemType: observable,
      open: observable,
    })
  }

  toggleOpen() {
    runInAction(() => {
      this.open = !this.open;
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

  sortItems() {
    this.items.sort((a, b) => {
      if (a.type === 'folder') {
        if (b.type === 'folder') {
          return a.name.localeCompare(b.name)
        }

        return -1;
      }

      if (b.type === 'folder') {
        return 1;
      }

      return a.name.localeCompare(b.name)
    })
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

        this.sortItems()

        item.parent = this;
      })
    }
  }

  addItems(items: ProjectItemInterface[]): void {
    runInAction(() => {
      this.items = items;

      this.sortItems();

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

        if (item === this.project.selectedItem) {
          this.project.selectedItem = null;
        }
      })  
    }
  }
}

export default Folder;
