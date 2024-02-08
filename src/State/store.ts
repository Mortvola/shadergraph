import React from "react";
import Graph from "./Graph";
import Modeler, { loadFbx } from "./Modeler";
import {
  GameObjectRecord, ModelInterface, ModelItem, ParticleItem, ParticleRecord, StoreInterface, TextureRecord,
} from "./types";
import { makeObservable, observable, runInAction } from "mobx";
import Renderer from "../Renderer/Renderer";
import Http from "../Http/src";
import Materials from "./Materials";
import { MaterialRecord, ProjectItemInterface, ShaderRecord } from "../Project/Types/types";
import GameObject from "./GameObject";
import Texture from "./Texture";
import { ParticleSystemInterface, SceneNodeInterface } from "../Renderer/types";
import ParticleSystem from "../Renderer/ParticleSystem";
import { renderer2d } from "../Main";
import Project from "../Project/Types/Project";
import { particleSystemManager } from "./ParticleSystemManager";

type OpenMenuItem = {
  menuItem: HTMLElement,
  menuRect: DOMRect,
}

class Store implements StoreInterface {
  get graph(): Graph | null {
    return this.project.selectedItem?.type === 'shader' && this.project.selectedItem?.item
      ? this.project.selectedItem?.item as Graph
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

  project = new Project();

  // projectItems = new Folder(-1, '', null, this)

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
      project: observable,
    })
  }

  static async create() {
    const mainRenderer = await Renderer.create();
    const previewRenderer = await Renderer.create();

    return new Store(mainRenderer, previewRenderer)
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
    if (this.project.selectedItem?.type === 'particle') {
      const particleSystem: ParticleSystem | null = this.project.selectedItem.getItem()

      if (particleSystem) {
        this.mainView.removeParticleSystem(particleSystem)
      }
    }

    runInAction(() => {
      this.project.selectedItem = item;
    })

    if (item.type === 'object') {
      if (item.item === null) {
        const response = await Http.get<GameObjectRecord>(`/game-objects/${item.itemId}`)

        if (response.ok) {
          const objectRecord = await response.body();
  
          runInAction(() => {
            item.item = new GameObject(objectRecord.id, objectRecord.name, objectRecord.object.items)
          })
        }  
      }

      const gameObject = item.item as GameObject;

      this.mainViewModeler.assignModel(null)

      for (const item  of gameObject.items) {
        if (item.type === 'model') {
          const modelEntry = item.item as ModelItem;

          const modelItem = this.project.getItemByItemId(modelEntry.id, 'model');

          if (modelItem) {
            const model = await this.getModel(modelItem)
    
            if (model) {
              this.mainViewModeler.assignModel(model, modelEntry.materials);
            }
          }    
        }
        else if (item.type === 'particle') {
          const particleEntry = item.item as ParticleItem;

          const particleSystem = await particleSystemManager.getParticleSystem(particleEntry.id)
  
          if (particleSystem) {
            this.mainView.addParticleSystem(particleSystem)
          }
        }
      }
    }
    else if (item.type === 'material') {
      if (item.item === null) {
        const response = await Http.get<MaterialRecord>(`/materials/${item.itemId}`);

        if (response.ok) {
          const materialRecord = await response.body();

          runInAction(() => {
            item.item = materialRecord; // new MaterialItem(materialRecord.id, materialRecord.name, materialRecord.shaderId, materialRecord.properties);
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
        const particleSystem = await particleSystemManager.getParticleSystem(item.itemId!)

        if (particleSystem) {
          runInAction(() => {
            item.item = particleSystem
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
    let model: SceneNodeInterface | undefined = item.item as SceneNodeInterface;

    if (!item.item) {
      model = await this.modeler.getModel(`/models/${item.itemId}`);

      item.item = model ?? null;
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
