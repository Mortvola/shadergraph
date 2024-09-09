import { objectManager } from "./ObjectManager";
import { SceneNodeBase } from "./SceneNodeBase";
import type { PrefabInstanceInterface, PrefabNodeInstanceInterface, PrefabNodeInterface } from "./Types";

class PrefabNodeInstance extends SceneNodeBase implements PrefabNodeInstanceInterface {
  prefabInstance: PrefabInstanceInterface;

  baseNode: PrefabNodeInterface;

  constructor(prefabInstance: PrefabInstanceInterface, ancestor: PrefabNodeInterface) {
    super()

    this.prefabInstance = prefabInstance;
    this.baseNode = ancestor
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

  async delete(): Promise<void> {
    return objectManager.delete(this);
  }

  isPrefabInstanceRoot(): boolean {
    return this.id === 0; 
  }

  toDescriptor(): object {
    return {}    
  }
}

export const isPrefabInstanceObject = (r: unknown): r is PrefabNodeInstance => (
  r !== undefined && r !== null
  && (r as PrefabNodeInstance).prefabInstance !== undefined
)

export default PrefabNodeInstance
