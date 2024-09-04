import { SceneObjectBase } from "./SceneObjectBase";
import type { PrefabInstanceInterface, PrefabInstanceObjectInterface, PrefabNodeInterface } from "./Types";

export class PrefabInstanceObject extends SceneObjectBase implements PrefabInstanceObjectInterface {
  // components: ComponentOverrides[] = [];

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
    // Since one cannot delete an individual node in a pref instance,
    // for all node delete request, send them to the prefab instance
    this.prefabInstance.delete()
  }
}

export default PrefabInstanceObject
