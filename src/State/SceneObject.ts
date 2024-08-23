import { makeObservable, observable } from "mobx";
import Entity from "./Entity";
import { SceneObjectInterface } from "./types";
import Http from "../Http/src";
import { ComponentType, GameObjectItem, GameObjectRecord, ParticleItem } from "../Renderer/types";
import { vec4 } from "wgpu-matrix";
import SceneNode from "../Renderer/Drawables/SceneNodes/SceneNode";
import { particleSystemManager } from "../Renderer/ParticleSystem/ParticleSystemManager";
import Light from "../Renderer/Drawables/Light";

let nextObjectId = 0;

const getNextObjectId = () => {
  nextObjectId -= 1;
  
  return nextObjectId;
}

class SceneObject extends Entity implements SceneObjectInterface {
  items: GameObjectItem[] = []

  translate = vec4.create(0, 0, 0, 0);

  sceneNode: SceneNode | null = null;

  constructor(id = getNextObjectId(), name?: string, items: GameObjectItem[] = [] ) {
    super(id, name ?? `Scene Object ${Math.abs(id)}`)
    
    this.items = items.map((i, index) => ({
      ...i,
      key: index,
    }));

    makeObservable(this, {
      items: observable,
    })
  }

  static async fromServer(itemId: number): Promise<SceneObject | undefined> {
    const response = await Http.get<GameObjectRecord>(`/game-objects/${itemId}`)

    if (response.ok) {
      const objectRecord = await response.body();

      return new SceneObject(objectRecord.id, objectRecord.name, objectRecord.object.items)
      // runInAction(() => {
      //   // if (isGameObject2D(objectRecord.object)) {
      //   //   item.item = new GameObject2D(objectRecord.id, objectRecord.name, objectRecord as GameObject2DRecord)
      //   // }
      //   // else {
      //     item.item = new GameObject(objectRecord.id, objectRecord.name, objectRecord.object.items)
      //   // }
      // })
    }  
  }

  async save(): Promise<void> {
    const response = await Http.patch<GameObjectRecord, void>(`/game-objects/${this.id}`, {
      id: this.id,
      name: this.name,
      object: {
        items: this.items.map((i) => {
          const { key, ...rest } = i;

          return rest;
        }),
      }
    });

    if (response.ok) {

    }
  }

  addComponent(component: GameObjectItem) {
    this.items = [
      ...this.items,
      component,
    ];

    if (this.sceneNode) {
      (async () => {
        if (this.sceneNode) {
          if (component.type === ComponentType.ParticleSystem) {
            const ps = await particleSystemManager.getParticleSystem((component.item as ParticleItem).id)
      
            if (ps) {
              this.sceneNode.addComponent(ps)
            }
          }
          else if (component.type === ComponentType.Light) {
            const light = new Light();
            this.sceneNode.addComponent(light);
          }
        }
      })()  
    }
  }
}

export default SceneObject;
