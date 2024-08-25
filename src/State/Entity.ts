import { makeObservable, observable, runInAction } from "mobx";
import { EntityInterface } from "./types";

class Entity implements EntityInterface {
  id: number;

  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;

    makeObservable(this, {
      name: observable,
    })
  }
}

export default Entity;
