import React from "react";
import type Graph from "./Graph";
import Modeler from "./Modeler";
import type {
  ModelInterface} from "./types";
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

class Store implements StoreInterface {
  get graph(): Graph | null {
    return this.project.selectedItem?.type === 'shader' && this.project.selectedItem?.item
      ? this.project.selectedItem?.item as Graph
      : null
  }

  private dragObject: unknown | null = null;

  previewModeler: Modeler;

  mainViewModeler: Modeler;

  @observable
  accessor models: ModelInterface[] = [];

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

    this.mainViewModeler = new Modeler(this.mainView, this);
    this.previewModeler = new Modeler(previewRenderer, this);

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

  async selectItem(item: ProjectItemLike) {
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
      this.project.selectedItem = item;
    })

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
              this.graph?.applyMaterial()  
            })  
          }  
        }

        break;
      }
    }
  }

  async getModel(item: ProjectItemInterface<RenderNodeInterface>) {
    let model: RenderNodeInterface | null = await item.getItem();

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
