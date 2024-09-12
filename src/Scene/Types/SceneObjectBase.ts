import { observable, runInAction } from "mobx";
import type { NewSceneObjectComponent, SceneObjectComponent, TransformPropsInterface } from "../../Renderer/Types";
import ObjectBase from "./ObjectBase";
import type { SceneObjectBaseInterface } from "./Types";
import TransformProps from "../../Renderer/Properties/TransformProps";

  
export class SceneNodeBase extends ObjectBase implements SceneObjectBaseInterface {
  @observable
  accessor components: SceneObjectComponent[] = []

  componentOverrides: SceneObjectComponent[] = []

  transformProps: TransformPropsInterface = new TransformProps();

  // renderNode = new RenderNode();

  baseObject?: SceneNodeBase

  derivedObjects: SceneNodeBase[] = []

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
    // vec3.copy(this.transformProps.translate.get(), this.renderNode.translate)
    // vec3.copy(this.transformProps.scale.get(), this.renderNode.scale)

    this.onChange();
  }

  isPrefabInstanceRoot(): boolean {
    return false;
  }

  toDescriptor(): object {
    return {}    
  }
}

