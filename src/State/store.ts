import React from "react";
import Modeler from "./Modeler";
import type {
  ModelItemInterface} from "./types";
import type { SceneInterface } from "../Scene/Types/Types";
import { isGameObject } from "../Scene/Types/Types";
import { observable, reaction, runInAction } from "mobx";
import Renderer from "../Renderer/Renderer";
import type { ProjectItemInterface, ProjectItemLike } from "../Project/Types/types";
import { isSceneItem, isShaderItem, ProjectItemType } from "../Project/Types/types";
import type {
  RenderNodeInterface} from "../Renderer/Types";
import {
  ComponentType,
} from "../Renderer/Types";
import { shaderGraphRenderer } from "../Main";
import Project from "../Project/Types/Project";
import type { StoreInterface } from "./StoreInterface";
import { type GraphInterface } from "./GraphInterface";
import { modelManager } from "../Renderer/Models/ModelManager";
import ModelItem from "../Renderer/Models/ModelItem";

class Store implements StoreInterface {
  @observable
  accessor graph: GraphInterface | null = null

  private dragObject: unknown | null = null;

  previewModeler: Modeler;

  mainViewModeler: Modeler;

  @observable
  accessor models: ModelItemInterface[] = [];

  mainView: Renderer;

  shaderPreview: Renderer;

  @observable
  accessor project: Project;

  @observable
  accessor scene: SceneInterface | undefined;

  // projectItems = new Folder(-1, '', null, this)

  draggingItem: ProjectItemLike | null = null;

  private constructor(mainRenderer: Renderer, previewRenderer: Renderer) {
    this.project = new Project();
    const projectId = parseInt(localStorage.getItem('projectId') ?? '1', 10);
    this.project.open(projectId);

    this.mainView = mainRenderer;
    this.shaderPreview = previewRenderer;

    this.mainViewModeler = new Modeler(this.mainView);
    this.previewModeler = new Modeler(previewRenderer);

    // Restore camera settings from local storage
    const cameraSettings = localStorage.getItem('camera');
    if (cameraSettings) {
      runInAction(() => {
        this.mainView.camera.offset = JSON.parse(cameraSettings)?.offset ?? this.mainView.camera.offset
        this.mainView.camera.rotateX = JSON.parse(cameraSettings)?.rotateX ?? this.mainView.camera.rotateX
        this.mainView.camera.finalRotateY = JSON.parse(cameraSettings)?.finalRotateY ?? this.mainView.camera.finalRotateY
      })
    }

    reaction(
      () => ({
        offset: this.mainView.camera.offset,
        rotateX: this.mainView.camera.rotateX,
        finalRotateY: this.mainView.camera.finalRotateY,
      }), 
      () => {
        localStorage.setItem('camera', JSON.stringify({
          offset: this.mainView.camera.offset,
          rotateX: this.mainView.camera.rotateX,
          finalRotateY: this.mainView.camera.finalRotateY,
        }))
      },
    )
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

  async selectItem(item: ProjectItemLike | null) {
    if (this.project.selectedItem?.type === ProjectItemType.SceneObject && isGameObject(this.project.selectedItem.item)) {
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
        else if (component.type === ComponentType.Decal) { /* empty */ }
      }  
    }

    runInAction(() => {
      if (item && this.scene) {
        this.scene.selectedNode = null;
      }
  
      item?.getItem()
      this.project.selectedItem = item;
    })
  }

  async openItem(item: ProjectItemLike) {
    switch (item.type) {
      case ProjectItemType.Scene: {
        if (isSceneItem(item)) {
          const scene = await item.getItem();

          if (scene) {
            runInAction(() => {
              if (this.scene) {
                this.scene.removeScene()
              }
              this.scene = scene;
              scene.renderScene();
            })    
          }  
        }
  
        break;
      }

      case 'shader': {
        if (isShaderItem(item)) {
          const shader = await item.getItem();

          if (shader) {
            runInAction(() => {
              shaderGraphRenderer.setTranslation(0, 0)
              this.graph = shader
              this.graph.applyMaterial()  
            })  
          }  
        }

        break;
      }
    }
  }

  async getModel(item: ProjectItemInterface<ModelItemInterface>) {
    let model: ModelItemInterface | null = await item.getItem();

    if (!model && item.itemId) {
      const m = await modelManager.getModel(item.itemId) ?? null;

      if (m) {
        item.item = new ModelItem(m)

        model = item.item
      }
    }

    return model?.model
  }  
}

const store = await Store.create();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
