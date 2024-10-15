import type { ComponentDescriptor, ComponentInterface, ComponentType, RenderNodeInterface } from '../Types';

class Component implements ComponentInterface {
  type: ComponentType;

  renderNode: RenderNodeInterface | null = null;

  onChange?: () => void;

  toDescriptor(): ComponentDescriptor {
    throw new Error('not implemented')
  }

  constructor(type: ComponentType) {
    this.type = type;
  }
}

export default Component;
