import { makeObservable, observable } from "mobx";
import { EntityInterface } from "./types";

let nextObjectId = 0;

export const getNextObjectId = () => {
  nextObjectId -= 1;
  
  return nextObjectId;
}

class Entity implements EntityInterface {
  id: number;

  name: string;

  constructor(id = getNextObjectId(), name: string) {
    this.id = id;
    this.name = name;

    makeObservable(this, {
      name: observable,
    })
  }
}

export default Entity;
