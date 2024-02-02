import React from "react";
import Graph from "./Graph";
import Modeler, { loadFbx } from "./Modeler";
import {
  GameObjectRecord, MaterialRecord, ModelInterface, ParticleRrecord, ProjectItemRecord, ShaderRecord, StoreInterface, TextureRecord,
} from "./types";
import { makeObservable, observable, runInAction } from "mobx";
import Renderer from "../Renderer/Renderer";
import Http from "../Http/src";
import Materials from "./Materials";
import { FolderInterface, ProjectItemInterface, isFolder } from "../Project/Types/types";
import ProjectItem from "../Project/Types/ProjectItem";
import GameObject from "./GameObject";
import Folder from "../Project/Types/Folder";
import Material from "./Material";
import Texture from "./Texture";
import { ParticleSystemInterface, SceneNodeInterface } from "../Renderer/types";
import ParticleSystem from "../Renderer/ParticleSystem";
import { renderer2d } from "../Main";

type OpenMenuItem = {
  menuItem: HTMLElement,
  menuRect: DOMRect,
}

class Store implements StoreInterface {
  get graph(): Graph | null {
    return this.selectedItem?.type === 'shader' && this.selectedItem?.item
      ? this.selectedItem?.item as Graph
      : null
  }

  private dragObject: unknown | null = null;

  modeler: Modeler;

  mainViewModeler: Modeler;

  models: ModelInterface[] = [];

  menus: OpenMenuItem[] = [];

  mainView: Renderer;

  shaderPreview: Renderer;

  materials: Materials;

  selectedItem: ProjectItemInterface | null = null;

  projectItems = new Folder(-1, '', null, this)

  draggingItem: ProjectItemInterface | null = null;

  private constructor(mainRenderer: Renderer, previewRenderer: Renderer) {
    this.mainView = mainRenderer;
    this.shaderPreview = previewRenderer;

    this.mainViewModeler = new Modeler(this.mainView, this);
    this.modeler = new Modeler(previewRenderer, this);

    this.materials = new Materials(this);

    makeObservable(this, {
      menus: observable,
      // graph: observable,
      models: observable,
      selectedItem: observable,
      projectItems: observable,
    })
  }

  static async create() {
    const mainRenderer = await Renderer.create();
    const previewRenderer = await Renderer.create();

    return new Store(mainRenderer, previewRenderer)
  }

  getFolder(folder: FolderInterface) {
    (async () => {
      const response = await Http.get<ProjectItemRecord[]>(`/folders${ folder.id === -1 ? '' : `/${folder.id}`}`);

      if (response.ok) {
        const list = await response.body();

        folder.addItems(list.map((i) => {
          if (i.type === 'folder') {
            return new Folder(i.id, i.name, folder, store)
          }

          return new ProjectItem(i.id, i.name, i.type, folder, i.itemId)
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

      const folder = new Folder(rec.id, rec.name, parent, store)

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

      const item = new ProjectItem(rec.id, rec.name, rec.type, parent, rec.itemId)

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

  addNewItem(type: string) {
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

  async createNewItem(name: string, type: string, folder: FolderInterface) {
    let parentId: number | null = folder.id;
    if (parentId === -1) {
      parentId = null;
    }

    let url: string | undefined = undefined;
    let payload: unknown = {};

    switch (type) {
      case 'object': {
        url = '/game-objects'
        payload = {
          name,
          object: {},
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

      case 'particle': {
        url = '/particles'
        payload = {
          name,
          descriptor: {},
        }

        break
      }
    }

    if (url) {
      const response = await Http.post<unknown, ProjectItemRecord>(`${url}?parentId=${parentId}`, payload)

      if (response.ok) {
        const rec = await response.body();
  
        const item = new ProjectItem(rec.id, rec.name, rec.type, folder, rec.itemId)
        folder.addItem(item);
      }
  
      runInAction(() => {
        folder.newItem = null;
      })  
    }
  }

  getItem(id: number, type: string): ProjectItemInterface | undefined {
    let stack: ProjectItemInterface[] = [this.projectItems]

    while (stack.length > 0) {
      const item = stack[0];
      stack = stack.slice(1);

      if (item.itemId === id && item.type === type) {
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

  async applyMaterial(): Promise<void> {
    if (this.graph) {
      const material = await this.graph.generateMaterial();

      if (material) {
        this.modeler.applyMaterial(material);
      }  
    }
  }

  setDragObject(object: unknown | null) {
    this.dragObject = object;
  }

  getDragObject(): unknown | null {
    return this.dragObject;
  }

  async selectItem(item: ProjectItemInterface) {
    if (this.selectedItem?.type === 'particle') {
      const particleSystem: ParticleSystem | null = this.selectedItem.getItem()

      if (particleSystem) {
        this.mainView.removeParticleSystem(particleSystem)
      }
    }

    runInAction(() => {
      this.selectedItem = item;
    })

    if (item.type === 'object') {
      if (item.item === null) {
        const response = await Http.get<GameObjectRecord>(`/game-objects/${item.itemId}`)

        if (response.ok) {
          const objectRecord = await response.body();
  
          runInAction(() => {
            item.item = new GameObject(objectRecord.id, objectRecord.name, objectRecord.object.modelId, objectRecord.object.materials)
          })
        }  
      }

      const gameObject = item.item as GameObject;

      const modelItem = this.getItem(gameObject.modelId, 'model');

      if (modelItem) {
        const model = await this.getModel(modelItem)

        if (model) {
          this.mainViewModeler.assignModel(model, gameObject.materials);
        }
      }
    }
    else if (item.type === 'material') {
      if (item.item === null) {
        const response = await Http.get<MaterialRecord>(`/materials/${item.itemId}`);

        if (response.ok) {
          const materialRecord = await response.body();

          runInAction(() => {
            item.item = new Material(materialRecord.id, materialRecord.name, materialRecord.shaderId, materialRecord.properties);
          })
        }
      }
    }
    else if (item.type === 'texture') {
      if (item.item === null) {
        const response = await Http.get<TextureRecord>(`/textures/${item.itemId}`);

        if (response.ok) {
          const record = await response.body();

          runInAction(() => {
            item.item = new Texture(record.id, record.name, record.flipY);
          })
        }
      }
    }
    else if (item.type === 'shader') {
      if (item.item === null) {
        const response = await Http.get<ShaderRecord>(`/shader-descriptors/${item.itemId}`)

        if (response.ok) {
          const descriptor = await response.body();

          runInAction(() => {
            item.item = new Graph(store, descriptor.id, descriptor.name, descriptor.descriptor);    
          })
        }  
      }

      runInAction(() => {
        // this.graph = item.item as Graph;
        renderer2d.setTranslation(0, 0)
        this.applyMaterial()  
      })
    }
    else if (item.type === 'particle') {
      if (item.item === null) {
        const response = await Http.get<ParticleRrecord>(`/particles/${item.itemId}`)

        if (response.ok) {
          const rec = await response.body();

          runInAction(() => {
            item.item = new ParticleSystem(rec.id, rec.descriptor);    
          })
        }  
      }

      const particleSystem: ParticleSystemInterface | null = item.getItem()
      if (particleSystem) {
        this.mainView.addParticleSystem(particleSystem)
      }

      this.mainViewModeler.assignModel(null);
    }

    // if (item.type !== 'shader') {
    //   runInAction(() => {
    //     this.graph = null;
    //   })
    // }
  }

  async getModel(item: ProjectItemInterface) {
    let model: SceneNodeInterface | null = item.item as SceneNodeInterface;

    if (!item.item) {
      model = await loadFbx(`/models/${item.itemId}`);

      item.item = model;
    }

    return model
  }  
}

const store = await Store.create();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
