import { makeObservable, observable, runInAction } from "mobx";
import ProjectItem from "./ProjectItem";
import type { FolderInterface, ProjectInterface, ProjectItemLike} from "./types";
import { ProjectItemType, isFolder } from "./types";
import Http from "../../Http/src";

class Folder extends ProjectItem<FolderInterface> implements FolderInterface {
  items: ProjectItemLike[] = []

  project: ProjectInterface

  newItemType: ProjectItemType | null = null;

  open = true;

  constructor(id: number, name: string, parent: FolderInterface | null, project: ProjectInterface) {
    super(id, name, ProjectItemType.Folder, parent, null)

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

  isAncestor(item: ProjectItemLike): boolean {
    if (isFolder(item)) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
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

  async addItem(item: ProjectItemLike): Promise<void> {
    if (item.parent !== this) {
      if (this.isAncestor(item)) {
        throw new Error('item is an ancestor of the destination')
      }
  
      const response = await Http.patch(`/api/folders/${item.id}`, {
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
    else {
      runInAction(() => {
        const index = this.items.findIndex((i) => (i.id === item.id))

        if (index === -1) {
          this.items = this.items.concat([item]);

          this.sortItems()
        }
      })
    }
  }

  addItems(items: ProjectItemLike[]): void {
    runInAction(() => {
      this.items = items;

      this.sortItems();

      for (const item of this.items) {
        item.parent = this;
      }
    })
  }

  async removeItem(item: ProjectItemLike): Promise<void> {
    const response = await Http.patch(`/api/folders/${item.id}`, {
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

  async deleteItem(item: ProjectItemLike) {
    const response = await Http.delete(`/api/folders/${item.id}`)

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
