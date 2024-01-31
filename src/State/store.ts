import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import {
  GameObjectInterface, GameObjectRecord, MaterialRecord, ModelInterface, ProjectItemRecord, ShaderInterface, StoreInterface, TextureInterface,
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

type OpenMenuItem = {
  menuItem: HTMLElement,
  menuRect: DOMRect,
}

class Store implements StoreInterface {
  graph: Graph | null = null;

  private dragObject: unknown | null = null;

  modeler: Modeler;

  mainViewModeler: Modeler;

  models: ModelInterface[] = [];

  menus: OpenMenuItem[] = [];

  mainView: Renderer;

  shaderPreview: Renderer;

  materials: Materials;

  selectionType: 'Material' | 'Object' | 'Texture' | 'Shader' | 'Model' | null = null;

  // selectedMaterial: MaterialInterface | null = null;

  selectedTexture: TextureInterface | null = null;

  // selectedGameObject: GameObjectInterface | null = null;

  selectedShader: ShaderInterface | null = null;

  selectedModel: ModelInterface | null = null;

  selectedItem: ProjectItemInterface | null = null;

  projectItems = new Folder(-1, '', null)

  draggingItem: ProjectItemInterface | null = null;

  private constructor(mainRenderer: Renderer, previewRenderer: Renderer) {
    this.mainView = mainRenderer;
    this.shaderPreview = previewRenderer;

    this.mainViewModeler = new Modeler(this.mainView, this);
    this.modeler = new Modeler(previewRenderer, this);

    this.materials = new Materials(this);

    makeObservable(this, {
      menus: observable,
      graph: observable,
      selectionType: observable,
      // selectedMaterial: observable,
      selectedTexture: observable,
      // selectedGameObject: observable,
      selectedShader: observable,
      selectedModel: observable,
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
            return new Folder(i.id, i.name, folder)
          }

          return new ProjectItem(i.id, i.name, i.type, folder, i.itemId)
        }));
      }
    })()
  }

  async createFolder() {
    let parent: FolderInterface | null = this.projectItems;
    if (this.selectedItem) {
      if (this.selectedItem.type === 'folder') {
        parent = this.selectedItem as FolderInterface
      }
      else {
        parent = this.selectedItem.parent;
      }
    }

    let parentId = parent?.id ?? null;
    if (parentId === -1) {
      parentId = null;
    }

    const response = await Http.post<{ name: string, parentId: number | null }, ProjectItemRecord>('/folders', {
      name: 'New Folder', parentId,
    });

    if (response.ok) {
      const rec = await response.body();

      const folder = new Folder(rec.id, rec.name, parent)

      await this.projectItems.addItem(folder);
      // this.projectItems = this.projectItems.concat([folder]);
      // this.projectItems.sort((a, b) => a.name.localeCompare(b.name))
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

  getModel(id: number): ModelInterface | undefined {
    return this.models.find((m) => m.id === id);
  }

  async applyChanges(): Promise<void> {
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
    runInAction(() => {
      this.selectedItem = item;
    })

    if (item.type === 'object') {
      if (item.item === null) {
        const response = await Http.get<GameObjectRecord>(`/game-objects/${item.itemId}`)

        if (response.ok) {
          const objectRecord = await response.body();
  
          item.item = new GameObject(objectRecord.id, objectRecord.name, objectRecord.object.modelId, objectRecord.object.materials)
        }  
      }

      const gameObject = item.item as GameObject;
      this.mainViewModeler.loadModel(`/models/${gameObject.modelId}`, gameObject.materials);
    }
    else if (item.type === 'material') {
      const response = await Http.get<MaterialRecord>(`/materials/${item.itemId}`);

      if (response.ok) {
        const materialRecord = await response.body();

        item.item = new Material(materialRecord.id, materialRecord.name, materialRecord.shaderId, materialRecord.properties);
      }
    }
  }

  async selectTexture(textureRecord: TextureInterface) {
    runInAction(() => {
      this.selectionType = 'Texture'
      this.selectedTexture = textureRecord
    })
  }

  async selectShader(shaderRecord: ShaderInterface) {
    runInAction(() => {
      this.selectionType = 'Shader'
      this.selectedShader = shaderRecord
    })
  }

  async selectModel(modelRecord: ModelInterface) {
    runInAction(() => {
      this.selectionType = 'Model'
      this.selectedModel = modelRecord
    })
  }
}

export const convertType = (type: string) => {
  switch (type) {
    case 'float':
      return '1';

    case 'vec2f':
      return '2';

    case 'vec4f':
      return '4';

    case 'texture2D':
      return 'T2';

    case 'sampler':
      return 'S';

    default:
      return type;
  }
}

const store = await Store.create();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
