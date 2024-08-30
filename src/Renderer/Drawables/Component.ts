import { ComponentDescriptor, ComponentInterface, ComponentType, SceneNodeInterface } from "../Types";

class Component implements ComponentInterface {
  type: ComponentType;

  sceneNode: SceneNodeInterface | null = null;

  onChange?: () => void;

  toDescriptor(): ComponentDescriptor {
    throw new Error('not implemented')
  }

  constructor(type: ComponentType) {
    this.type = type;
  }
}

export default Component;
