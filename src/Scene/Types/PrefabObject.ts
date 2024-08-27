import Entity from "../../State/Entity";
import { PrefabObjectDescriptor, PrefabObjectInterface } from "../../State/types";
import PrefabNode from "./PrefabNode";

class PrefabObject extends Entity implements PrefabObjectInterface {
  root?: PrefabNode;

  constructor(id = -1, name?: string, root?: PrefabNode) {
    super(id, name ?? `PrefabObject ${Math.abs(id)}`)
    this.root = root;
  }

  static async fromDescriptor(descriptor: PrefabObjectDescriptor) {
    const prefabObject = new PrefabObject();

    if (descriptor) {
      prefabObject.id = descriptor.id;
      prefabObject.name = descriptor.name;

      if (descriptor.root) {
        prefabObject.root = await PrefabNode.fromDescriptor(prefabObject, descriptor.root)
      }
    }

    return prefabObject;
  }

  toDescriptor(): PrefabObjectDescriptor {
    return ({
      id: this.id,
      name: this.name,
      root: this.root?.toDescriptor(),
    })
  }
}

export default PrefabObject;
