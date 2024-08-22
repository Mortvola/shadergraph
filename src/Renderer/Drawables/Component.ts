import { SceneNodeInterface } from "../types";

export enum ComponentType {
  Drawable = 'Drawable',
  Light = 'Light',
}

class Component {
  type: ComponentType;

  sceneNode: SceneNodeInterface | null = null;

  constructor(type: ComponentType) {
    this.type = type;
  }
}

export default Component;
