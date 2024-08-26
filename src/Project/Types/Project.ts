import { makeObservable, observable, runInAction } from "mobx";
import Http from "../../Http/src";
import { ProjectItemRecord } from "../../State/types";
import Folder from "./Folder";
import ProjectItem from "./ProjectItem";
import { FolderInterface, ProjectInterface, ProjectItemInterface, ProjectItemType, isFolder } from "./types";

class Project implements ProjectInterface {
  projectItems: Folder

  selectedItem: ProjectItemInterface | null = null;

  constructor() {
    this.projectItems = new Folder(-1, '', null, this)

    makeObservable(this, {
      selectedItem: observable,
    })
  }

  getFolder(folder: FolderInterface) {
    (async () => {
      const response = await Http.get<ProjectItemRecord[]>(`/folders${ folder.id === -1 ? '' : `/${folder.id}`}`);

      if (response.ok) {
        const list = await response.body();

        folder.addItems(list.map((i) => {
          if (i.type === 'folder') {
            return new Folder(i.id, i.name, folder, this)
          }

          return new ProjectItem(i.id, i.name, i.type as ProjectItemType, folder, i.itemId)
        }));
      }
    })()
  }

  getNewItemParent(): FolderInterface {
    if (this.selectedItem) {
      if (this.selectedItem.type === 'folder') {
        return this.selectedItem as FolderInterface
      }

      if (this.selectedItem.parent) {
        return this.selectedItem.parent;
      }
    }

    return this.projectItems;
  }

  async createFolder() {
    const parent = this.getNewItemParent()

    let parentId: number | null = parent.id;
    if (parentId === -1) {
      parentId = null;
    }

    const response = await Http.post<{ name: string, parentId: number | null }, ProjectItemRecord>('/folders', {
      name: 'New Folder', parentId,
    });

    if (response.ok) {
      const rec = await response.body();

      const folder = new Folder(rec.id, rec.name, parent, this)

      await this.projectItems.addItem(folder);
      // this.projectItems = this.projectItems.concat([folder]);
      // this.projectItems.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  async importItem(file: File, url: string) {
    let parent = this.getNewItemParent()

    let parentId: number | null = parent.id;
    if (parentId === -1) {
      parentId = null;
    }

    const formData = new FormData();
    formData.append('file', file)

    const response = await fetch(`${url}?parentId=${parentId}`, {
      method: 'POST',
      body: formData
    })

    if (response.ok) {
      const rec = await response.json() as ProjectItemRecord

      const item = new ProjectItem(rec.id, rec.name, rec.type as ProjectItemType, parent, rec.itemId)

      parent.addItem(item)

      runInAction(() => {
        this.selectedItem = item;        
      })
    }
  }

  importModel(file: File) {
    this.importItem(file, '/models')
  }

  importTexture(file: File) {
    this.importItem(file, '/textures')
  }

  addNewItem(type: ProjectItemType) {
    let parent = this.getNewItemParent()

    runInAction(() => {
      parent.newItem = type;
    })
  }

  cancelNewItem(folder: FolderInterface) {
    runInAction(() => {
      folder.newItem = null;
    })
  }

  async createNewItem(name: string, type: ProjectItemType, folder: FolderInterface) {
    let parentId: number | null = folder.id;
    if (parentId === -1) {
      parentId = null;
    }

    let url: string | undefined = undefined;
    let payload: unknown = {};

    switch (type) {
      case 'object': {
        url = '/scene-objects'
        payload = {
          name,
          object: {},
        }

        break
      }

      case 'object2D': {
        url = '/scene-objects'
        payload = {
          name,
          object: {
            x: -0.1 / 2,
            y: 0.1 / 2,
            width: 0.1,
            height: 0.1
          },
        }

        break
      }

      case 'shader': {
        url = '/shader-descriptors'
        payload = {
          name,
          descriptor: {},
        }

        break
      }

      case 'material': {
        url = '/materials'

        payload = {
          name,
          shaderId: -1,
          properties: [],
        }
        break;
      }

      case 'particle': {
        url = '/particles'
        payload = {
          name,
          descriptor: {},
        }

        break
      }

      case 'scene': {
        url = '/scenes'
        payload = {
          name,
          scene: {
            objects: null,
          },
        }

        break
      }
    }

    if (url) {
      const response = await Http.post<unknown, ProjectItemRecord>(`${url}?parentId=${parentId}`, payload)

      if (response.ok) {
        const rec = await response.body();
  
        const item = new ProjectItem(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)
        folder.addItem(item);
      }
  
      runInAction(() => {
        folder.newItem = null;
      })  
    }
  }

  getItemByItemId(itemId: number, type: string): ProjectItemInterface | undefined {
    let stack: ProjectItemInterface[] = [this.projectItems]

    while (stack.length > 0) {
      const item = stack[0];
      stack = stack.slice(1);

      if (item.itemId === itemId && item.type === type) {
        return item;
      }

      if (isFolder(item)) {
        stack = stack.concat(item.items)
      }
    }
  }

  getAllItemsOfType(type: string): ProjectItemInterface[] {
    let stack: ProjectItemInterface[] = [this.projectItems]
    const items: ProjectItemInterface[] = [];

    while (stack.length > 0) {
      const item = stack[0];
      stack = stack.slice(1);

      if (item.type === type) {
        items.push(item);
      }

      if (isFolder(item)) {
        stack = stack.concat(item.items)
      }
    }

    return items;
  }
}

export default Project;
