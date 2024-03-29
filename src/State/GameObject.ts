import { makeObservable, observable } from "mobx";
import Entity from "./Entity";
import { GameObjectInterface } from "./types";
import Http from "../Http/src";
import { GameObjectItem, GameObjectRecord } from "../Renderer/types";

class GameObject extends Entity implements GameObjectInterface {
  items: GameObjectItem[] = []

  constructor(id: number, name: string, items: GameObjectItem[] ) {
    super(id, name)
    
    this.items = items.map((i, index) => ({
      ...i,
      key: index,
    }));

    makeObservable(this, {
      items: observable,
    })
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
}

export default GameObject;
