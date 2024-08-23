import { ComponentInterface, ComponentType, SceneNodeInterface } from "../types";

class Component implements ComponentInterface {
  type: ComponentType;

  sceneNode: SceneNodeInterface | null = null;

  constructor(type: ComponentType) {
    this.type = type;
  }
}

export default Component;
