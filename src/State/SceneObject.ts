import { makeObservable, observable } from "mobx";
import Entity from "./Entity";
import { SceneObjectInterface } from "./types";
import Http from "../Http/src";
import { GameObjectItem, GameObjectRecord } from "../Renderer/types";
import { vec4 } from "wgpu-matrix";

let nextObjectId = 0;

const getNextObjectId = () => {
  nextObjectId -= 1;
  
  return nextObjectId;
}

class SceneObject extends Entity implements SceneObjectInterface {
  items: GameObjectItem[] = []

  // components: Component[] = []

  translate = vec4.create(0, 0, 0, 0);

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
    ]
  }
}

export default SceneObject;
