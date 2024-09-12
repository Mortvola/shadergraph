import { observable, runInAction } from "mobx";
import type { NewSceneObjectComponent, SceneObjectComponent, TransformPropsInterface } from "../../Renderer/Types";
import ObjectBase from "./ObjectBase";
import type { SceneObjectBaseInterface } from "./Types";
import TransformProps from "../../Renderer/Properties/TransformProps";
import type TreeNode from "./TreeNode";

  
export class SceneObjectBase extends ObjectBase implements SceneObjectBaseInterface {
  @observable
  accessor components: SceneObjectComponent[] = []

  componentOverrides: SceneObjectComponent[] = []

  transformProps: TransformPropsInterface = new TransformProps();

  baseObject?: SceneObjectBase

  derivedObjects: SceneObjectBase[] = []

  treeNode?: TreeNode;

  nextComponentId = 0;

  autosave = true;

  constructor(id?: number, name?: string) {
    super(id, name ?? `Scene Object ${Math.abs(id ?? 0)}`)
  }

  getObjectId(): number {
    throw new Error('not implemented')
  }

  onChange = (): void => {
    throw new Error('not implemented')
  }

  async delete(): Promise<void> {
    throw new Error('not implemented')
  }

  async save(): Promise<void> {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addComponent(_component: NewSceneObjectComponent) {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeComponent(_component: SceneObjectComponent) {
    throw new Error('not implemented')
  }

  detachSelf() {
    // if (this.parent) {
    //   this.parent.removeObject(this);
    //   this.parent = null;
    // }
  }

  changeName(name: string) {
    runInAction(() => {
      this.name = name;
      this.onChange();
    })
  }

  getNextComponentId(): number {
    const nextComponentId = this.nextComponentId;
    this.nextComponentId += 1;

    return nextComponentId;    
  }

  transformChanged = () => {
    this.treeNode?.transformChanged()

    this.onChange();
  }

  isPrefabInstanceRoot(): boolean {
    return false;
  }

  toDescriptor(): object {
    return {}    
  }
}

