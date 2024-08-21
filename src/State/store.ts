import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import {
  ModelInterface, StoreInterface, TextureRecord, isGameObject, isGameObject2D,
} from "./types";
import { makeObservable, observable, runInAction } from "mobx";
import Renderer from "../Renderer/Renderer";
import Http from "../Http/src";
import { ProjectItemInterface } from "../Project/Types/types";
import GameObject from "./GameObject";
import Texture from "./Texture";
import {
  DecalItem, GameObject2DRecord, GameObjectRecord,
  MaterialRecordDescriptor,
  ModelItem, ParticleItem, ParticleSystemInterface, SceneNodeInterface, ShaderRecord,
} from "../Renderer/types";
import { renderer2d } from "../Main";
import Project from "../Project/Types/Project";
import { particleSystemManager } from "../Renderer/ParticleSystem/ParticleSystemManager";
import GameObject2D from "./GameObject2D";
import SceneNode2d from "../Renderer/Drawables/SceneNodes/SceneNode2d";
import Mesh from "../Renderer/Drawables/Mesh";
import { box } from "../Renderer/Drawables/Shapes/box";
import DrawableNode from "../Renderer/Drawables/SceneNodes/DrawableNode";
import { vec3 } from "wgpu-matrix";
import { materialManager } from "../Renderer/Materials/MaterialManager";

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

  // projectItems = new Folder(-1, '', null, this)

  draggingItem: ProjectItemInterface | null = null;

  private constructor(mainRenderer: Renderer, previewRenderer: Renderer) {
    this.mainView = mainRenderer;
    this.shaderPreview = previewRenderer;

    this.mainViewModeler = new Modeler(this.mainView, this);
    this.previewModeler = new Modeler(previewRenderer, this);

    makeObservable(this, {
      models: observable,
      project: observable,
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

  async selectItem(item: ProjectItemInterface) {
    if (this.project.selectedItem?.type === 'object' && isGameObject(this.project.selectedItem.item)) {
      for (const item of this.project.selectedItem.item.items) {
        if (item.type === 'particle') {
          this.mainView.removeParticleSystem((item.item as ParticleItem).id)
        }
        else if (item.type === 'model') {
          const modelItem = this.project.getItemByItemId((item.item as ModelItem).id, 'model');

          if (modelItem) {
            const model = await this.getModel(modelItem)
    
            if (model) {
              this.mainViewModeler.renderer.removeSceneNode(model)
            }
          }    
        }
        else if (item.type === 'decal') {
        }
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
            if (isGameObject2D(objectRecord.object)) {
              item.item = new GameObject2D(objectRecord.id, objectRecord.name, objectRecord as GameObject2DRecord)
            }
            else {
              item.item = new GameObject(objectRecord.id, objectRecord.name, objectRecord.object.items)
            }
          })
        }  
      }

      if (!isGameObject2D(item.item)) {
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
          else if (item.type === 'decal') {
            const decal = item.item as DecalItem;

            const drawable = await DrawableNode.create(
              await Mesh.create(box(1, 1, 1), 1),
              decal.materialId,
            )

            drawable.scale = vec3.create(decal.width ?? 1, 1, decal.height ?? 1)

            this.mainView.scene.addNode(drawable)
          }
        }
      }
      else {
        this.mainViewModeler.assignModel(null);

        const test = new SceneNode2d()
        test.x = item.item.x;
        test.y = item.item.y;
        test.width = item.item.width
        test.height = item.item.height
        // test.material = await materialManager.get(item.item.material!, '2D', [])

        this.mainView.scene2d.scene2d.nodes.push(test)
      }
    }
    else if (item.type === 'material') {
      if (item.item === null && item.itemId !==  null) {
        const materialItem = await materialManager.getItem(item.itemId) ?? null;

        runInAction(() => {
          item.item = materialItem;
        })
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
        this.graph?.applyMaterial()  
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
  }

  async getModel(item: ProjectItemInterface) {
    let model: SceneNodeInterface | undefined = item.item as SceneNodeInterface;

    if (!item.item && item.itemId) {
      model = await this.previewModeler.getModel(item.itemId);

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
