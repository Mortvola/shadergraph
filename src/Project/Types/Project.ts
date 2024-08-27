import { makeObservable, observable, runInAction } from "mobx";
import Http from "../../Http/src";
import { GameObject2DInterface, GraphInterface, MaterialItemInterface, PrefabObjectInterface, ProjectItemRecord, SceneInterface, SceneObjectInterface, TextureInterface } from "../../State/types";
import Folder from "./Folder";
import ProjectItem from "./ProjectItem";
import { FolderInterface, ProjectInterface, ProjectItemLike, ProjectItemType, isFolder } from "./types";
import { ParticleSystemInterface, SceneNodeInterface } from "../../Renderer/types";

class Project implements ProjectInterface {
  projectItems: Folder

  selectedItem: ProjectItemLike | null = null;

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

          const item = Project.constructProjectItem(i, folder);

          return item;
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

      const item = Project.constructProjectItem(rec, parent);

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
      parent.newItemType = type;
    })
  }

  cancelNewItem(folder: FolderInterface) {
    runInAction(() => {
      folder.newItemType = null;
    })
  }

  static getDefaultPayload(name: string, type: ProjectItemType) {
    let payload: unknown = {};

    switch (type) {
      case 'prefab': {
        payload = {
          name,
          object: {},
        }

        break;
      }

      case 'object': {
        payload = {
          name,
          object: {},
        }

        break
      }

      case 'object2D': {
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
        payload = {
          name,
          descriptor: {},
        }

        break
      }

      case 'material': {
        payload = {
          name,
          shaderId: -1,
          properties: [],
        }
        break;
      }

      case 'particle': {
        payload = {
          name,
          descriptor: {},
        }

        break
      }

      case 'scene': {
        payload = {
          name,
          scene: {
            objects: null,
          },
        }

        break
      }
    }

    return payload;
  }

  async createNewItem(name: string, type: ProjectItemType, folder: FolderInterface, payload?: unknown) {
    let parentId: number | null = folder.id;
    if (parentId === -1) {
      parentId = null;
    }

    let url: string | undefined = undefined;

    switch (type) {
      case 'prefab': {
        url = '/prefabs'

        break;
      }

      case 'object': {
        url = '/scene-objects'

        break
      }

      case 'object2D': {
        url = '/scene-objects'

        break
      }

      case 'shader': {
        url = '/shader-descriptors'

        break
      }

      case 'material': {
        url = '/materials'

        break;
      }

      case 'particle': {
        url = '/particles'

        break
      }

      case 'scene': {
        url = '/scenes'

        break
      }
    }

    runInAction(() => {
      folder.newItemType = null;
    })  

    if (url) {
      const response = await Http.post<unknown, ProjectItemRecord>(
        `${url}?parentId=${parentId}`,
        payload ?? Project.getDefaultPayload(name, type),
      )

      if (response.ok) {
        const rec = await response.body();
  
        const item = Project.constructProjectItem(rec, folder);
    
        folder.addItem(item);

        return item;
      }  
    }
  }

  private static constructProjectItem(rec: ProjectItemRecord, folder: FolderInterface) {
    let item: ProjectItemLike | undefined = undefined;
        
    switch (rec.type) {
      case 'prefab': {
        item = new ProjectItem<PrefabObjectInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break;
      }

      case 'object': {
        item = new ProjectItem<SceneObjectInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break
      }

      case 'object2D': {
        item = new ProjectItem<GameObject2DInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break
      }

      case 'shader': {
        item = new ProjectItem<GraphInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break
      }

      case 'material': {
        item = new ProjectItem<MaterialItemInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break;
      }

      case 'particle': {
        item = new ProjectItem<ParticleSystemInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break
      }

      case 'scene': {
        item = new ProjectItem<SceneInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break
      }

      case 'model': {
        item = new ProjectItem<SceneNodeInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break
      }

      case 'texture': {
        item = new ProjectItem<TextureInterface>(rec.id, rec.name, rec.type as ProjectItemType, folder, rec.itemId)

        break
      }
    }

    if (item === undefined) {
      throw new Error(`unknown project item: ${rec.type}`)
    }

    return item;
  }

  getItemByItemId(itemId: number, type: string): ProjectItemLike | undefined {
    let stack: ProjectItemLike[] = [this.projectItems]

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

  getAllItemsOfType(type: string): ProjectItemLike[] {
    let stack: ProjectItemLike[] = [this.projectItems]
    const items: ProjectItemLike[] = [];

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
