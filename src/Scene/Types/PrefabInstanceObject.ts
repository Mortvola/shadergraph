import { SceneObjectBase } from "./SceneObjectBase";
import type { PrefabInstanceInterface, PrefabInstanceObjectInterface, PrefabNodeInterface } from "./Types";

export class PrefabInstanceObject extends SceneObjectBase implements PrefabInstanceObjectInterface {
  prefabInstance: PrefabInstanceInterface;

  ancestor: PrefabNodeInterface;

  constructor(prefabInstance: PrefabInstanceInterface, ancestor: PrefabNodeInterface) {
    super()

    this.prefabInstance = prefabInstance;
    this.ancestor = ancestor
  }

  getObjectId(): number {
    return this.prefabInstance.id
  }

  onChange = () => {
    console.log('PrefabInstanceObject changed')

    if (this.prefabInstance?.autosave) {
      this.prefabInstance?.save();
    }
  }

  delete(): void {
    // Since one cannot delete an individual node in a prefab instance,
    // for all node delete requests, send them to the prefab instance
    // to delete the whole prefab
    this.prefabInstance.delete()
  }
}

export const isPrefabInstanceObject = (r: unknown): r is PrefabInstanceObject => (
  r !== undefined && r !== null
  && (r as PrefabInstanceObject).prefabInstance !== undefined
)

export default PrefabInstanceObject
