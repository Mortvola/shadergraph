import Entity from "./Entity";
import { GameObjectInterface, NodeMaterials } from "./types";

class GameObject extends Entity implements GameObjectInterface {
  modelId: number;

  materials?: NodeMaterials;

  constructor(id: number, name: string, modelId: number, materials?: NodeMaterials) {
    super(id, name)

    this.modelId = modelId;
    this.materials = materials;
  }
}

export default GameObject;
