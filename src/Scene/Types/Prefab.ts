import Entity from "../../State/Entity";
import { PrefabDescriptor, PrefabInterface } from "../../State/types";
import PrefabNode from "./PrefabNode";

class Prefab extends Entity implements PrefabInterface {
  root?: PrefabNode;

  constructor(id?: number, name?: string, root?: PrefabNode) {
    super(id, name ?? `PrefabObject ${Math.abs(id ?? 0)}`)
    this.root = root;
  }

  static async fromDescriptor(descriptor: PrefabDescriptor) {
    const prefabObject = new Prefab();

    if (descriptor) {
      prefabObject.id = descriptor.id;
      prefabObject.name = descriptor.name;

      if (descriptor.prefab.root) {
        prefabObject.root = await PrefabNode.fromDescriptor(prefabObject, descriptor.prefab.root)
      }
    }

    return prefabObject;
  }

  toDescriptor(): PrefabDescriptor {
    return ({
      id: this.id,
      name: this.name,
      prefab: {
        root: this.root?.toDescriptor(),
      }
    })
  }
}

export default Prefab;
