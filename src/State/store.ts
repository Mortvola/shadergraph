import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import {
  ModelInterface, SceneInterface, isGameObject,
} from "./types";
import { makeObservable, observable, runInAction } from "mobx";
import Renderer from "../Renderer/Renderer";
import { isSceneItem, isShaderItem, ProjectItemInterface, ProjectItemLike } from "../Project/Types/types";
import {
  SceneNodeInterface,
  ComponentType,
} from "../Renderer/Types";
import { renderer2d } from "../Main";
import Project from "../Project/Types/Project";
import { StoreInterface } from "./StoreInterface";

class Store implements StoreInterface {
  get graph(): Graph | null {
    return this.project.selectedItem?.type === 'shader' && this.project.selectedItem?.item
      ? this.project.selectedItem?.item as Graph
      : null
  }

  private dragObject: unknown | null = null;

  previewModeler: Modeler;

  mainViewModeler: Modeler;

  models: ModelInterface[] = [];

  mainView: Renderer;

  shaderPreview: Renderer;

  project = new Project();

  scene?: SceneInterface;

  // projectItems = new Folder(-1, '', null, this)

  draggingItem: ProjectItemLike | null = null;

  private constructor(mainRenderer: Renderer, previewRenderer: Renderer) {
    this.mainView = mainRenderer;
    this.shaderPreview = previewRenderer;

    this.mainViewModeler = new Modeler(this.mainView, this);
    this.previewModeler = new Modeler(previewRenderer, this);

    makeObservable(this, {
      models: observable,
      project: observable,
      scene: observable,
    })
  }

  static async create() {
    const mainRenderer = await Renderer.create();
    const previewRenderer = await Renderer.create(false);

    return new Store(mainRenderer, previewRenderer)
  }

  setDragObject(object: unknown | null) {
    this.dragObject = object;
  }

  getDragObject(): unknown | null {
    return this.dragObject;
  }

  async selectItem(item: ProjectItemLike) {
    if (this.project.selectedItem?.type === 'object' && isGameObject(this.project.selectedItem.item)) {
      for (const component of this.project.selectedItem.item.components) {
        if (component.type === ComponentType.ParticleSystem) {
          // const particleEntry = item.item as ParticleItem;
          // const particleSystem = await particleSystemManager.getParticleSystem(particleEntry.id)
          // if (particleSystem?.sceneNode) {
          //   this.mainView.removeSceneNode(particleSystem?.sceneNode)
          // }
        }
        else if (component.type === ComponentType.Mesh) {
          // const modelItem = this.project.getItemByItemId((item.item as ModelItem).id, 'model');

          // if (modelItem) {
          //   const model = await this.getModel(modelItem)
    
          //   if (model) {
          //     this.mainViewModeler.renderer.removeSceneNode(model)
          //   }
          // }    
        }
        else if (component.type === ComponentType.Decal) {
        }
      }  
    }

    runInAction(() => {
      this.project.selectedItem = item;
    })

    switch (item.type) {
      case 'scene': {
        if (isSceneItem(item)) {
          const scene = await item.getItem();

          if (scene) {
            runInAction(() => {
              this.scene = scene;
            })
    
            await scene.renderScene();
          }  
        }
  
        break;
      }

      case 'shader': {
        if (isShaderItem(item)) {
          const shader = await item.getItem();

          if (shader) {
            runInAction(() => {
              renderer2d.setTranslation(0, 0)
              this.graph?.applyMaterial()  
            })  
          }  
        }

        break;
      }
    }
  }

  async getModel(item: ProjectItemInterface<SceneNodeInterface>) {
    let model: SceneNodeInterface | null = await item.getItem();

    if (!model && item.itemId) {
      model = await this.previewModeler.getModel(item.itemId) ?? null;
    }

    return model ?? undefined
  }  
}

const store = await Store.create();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
