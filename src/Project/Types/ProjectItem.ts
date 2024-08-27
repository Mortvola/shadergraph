import { makeObservable, observable, runInAction } from "mobx";
import Http from "../../Http/src";
import { FolderInterface, ProjectItemLike, ProjectItemInterface, ProjectItemType } from "./types";
import { PrefabObjectDescriptor, SceneDescriptor, TextureRecord } from "../../State/types";
import GameObject2DData from '../../State/GameObject2D'
import SceneData from '../../Scene/Types/Scene'
import SceneObject from "../../Scene/Types/SceneObject";
import { ComponentType, ShaderRecord } from "../../Renderer/types";
import SceneNode2d from "../../Renderer/Drawables/SceneNodes/SceneNode2d";
import { materialManager } from "../../Renderer/Materials/MaterialManager";
import Texture from "../../State/Texture";
import Graph from "../../State/Graph";
import { store } from "../../State/store";
import { particleSystemManager } from "../../Renderer/ParticleSystem/ParticleSystemManager";
import PrefabObject from "../../Scene/Types/PrefabObject";

class ProjectItem implements ProjectItemInterface {
  id: number

  name: string

  type: ProjectItemType

  itemId: number | null

  parent: FolderInterface | null = null;

  item: ProjectItemLike | null = null;

  constructor(id: number, name: string, type: ProjectItemType, parent: FolderInterface | null, itemId: number | null) {
    this.id = id;
    this.itemId = itemId
    this.parent = parent
    this.name = name;
    this.type = type;

    makeObservable(this, {
      name: observable,
      item: observable,
    })
  }

  async changeName(name: string): Promise<void> {
    const response = await Http.patch(`/folders/${this.id}`, {
      name,
    })

    if (response) {
      runInAction(() => {
        this.name = name;
      })
    }
  }

  async delete(): Promise<void> {
    return this.parent?.deleteItem(this);
  }

  async getItem<T>(): Promise<T | null> {
    let item: T | null = this.item as (T | null);

    if (!item) {
      switch (this.type) {
        case 'scene': {
          const response = await Http.get<SceneDescriptor>(`/scenes/${this.itemId}`);
  
          if (response.ok) {
            const body = await response.body();
  
            const scene = await SceneData.fromDescriptor(body)

            if (scene) {
              item = scene as T;

              runInAction(() => {
                this.item = scene;
              })  
            }
          }
    
          break;
        }
  
        case 'object': {
          if (this.itemId !== null) {
            const object = await SceneObject.fromServer(this.itemId);
    
            if (object) {
              item = object as T;

              runInAction(() => {
                this.item = object;
              })
            }
            // const response = await Http.get<GameObjectRecord>(`/scene-objects/${item.itemId}`)
    
            // if (response.ok) {
            //   const objectRecord = await response.body();
      
            //   runInAction(() => {
            //     if (isGameObject2D(objectRecord.object)) {
            //       this.item = new GameObject2D(objectRecord.id, objectRecord.name, objectRecord as GameObject2DRecord)
            //     }
            //     else {
            //       this.item = new GameObject(objectRecord.id, objectRecord.name, objectRecord.object.items)
            //     }
            //   })
            // }  
          }
    
          if (item) {
            if (item instanceof SceneObject) {
              const gameObject = item as SceneObject;
      
              // this.mainViewModeler.assignModel(null)
      
              for (const component  of gameObject.components) {
                if (component.type === ComponentType.Mesh) {
                  // const modelEntry = item as ModelItem;
      
                  // const modelItem = this.project.getItemByItemId(modelEntry.id, 'model');
      
                  // if (modelItem) {
                  //   const model = await this.getModel(modelItem)
            
                  //   if (model) {
                  //     this.mainViewModeler.assignModel(model, modelEntry.materials);
                  //   }
                  // }    
                }
                // else if (component.type === ComponentType.ParticleSystem) {
                  // const particleEntry = item as ParticleItem;
      
                  // const particleSystem = await particleSystemManager.getParticleSystem(particleEntry.id)
          
                  // if (particleSystem) {
                  //   const node = new SceneNode();
                  //   node.addComponent(particleSystem)
      
                  //   this.mainView.addSceneNode(node)
                  // }
                // }
                else if (component.type === ComponentType.Decal) {
                  // const decal = item as DecalItem;
      
                  // const drawableNode = new SceneNode();
                  // const drawable = await DrawableComponent.create(
                  //   await Mesh.create(box(1, 1, 1), 1),
                  //   decal.materialId,
                  // )
                  // drawableNode.addComponent(drawable);
      
                  // drawableNode.scale = vec3.create(decal.width ?? 1, 1, decal.height ?? 1)
      
                  // this.mainView.scene.addNode(drawableNode)
                }
              }
            }
            else if (item instanceof GameObject2DData) {
              // this.mainViewModeler.assignModel(null);
      
              const test = new SceneNode2d()
              test.x = item.x;
              test.y = item.y;
              test.width = item.width
              test.height = item.height
              // test.material = await materialManager.get(item.material!, '2D', [])
      
              // this.mainView.scene2d.scene2d.nodes.push(test)
            }
          }
  
          break;
        }
  
        case 'prefab': {
          const response = await Http.get<{ prefab: PrefabObjectDescriptor }>(`/prefabs/${this.itemId}`);
    
          if (response.ok) {
            const body = await response.body();
  
            const prefab = await PrefabObject.fromDescriptor(body.prefab);
  
            if (prefab) {
              item = prefab as T;

              runInAction(() => {
                this.item = prefab;
              })  
            }
          }
  
          break;
        }
  
        case 'material': {
          if (this.itemId !==  null) {
            const materialItem = await materialManager.getItem(this.itemId) ?? null;
    
            if (materialItem) {
              item = materialItem as T;

              runInAction(() => {
                this.item = materialItem;
              })  
            }
          }
  
          break;
        }
  
        case 'texture': {
          const response = await Http.get<TextureRecord>(`/textures/${this.itemId}`);
  
          if (response.ok) {
            const record = await response.body();
  
            const texture = new Texture(record.id, record.name, record.flipY);

            item = texture as T;

            runInAction(() => {
              this.item = texture;
            })
          }
  
          break;
        }
  
        case 'shader': {
          const response = await Http.get<ShaderRecord>(`/shader-descriptors/${this.itemId}`)
  
          if (response.ok) {
            const descriptor = await response.body();
  
            const shader = new Graph(store, descriptor.id, descriptor.name, descriptor.descriptor);

            item = shader as T;

            runInAction(() => {
              this.item = shader
            })
          }  
      
          break;
        }
  
        case 'particle': {
          const particleSystem = await particleSystemManager.getParticleSystem(this.itemId!)
  
          if (particleSystem) {
            item = particleSystem as T;

            runInAction(() => {
              this.item = particleSystem
            })  
          }
      
          break;
        }
      }
    }

    return item
  }
}

export default ProjectItem;
