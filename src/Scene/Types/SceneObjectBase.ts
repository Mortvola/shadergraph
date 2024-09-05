import { vec3 } from "wgpu-matrix";
import { runInAction } from "mobx";
import type { NewSceneObjectComponent, SceneObjectComponent, TransformPropsInterface } from "../../Renderer/Types";
import NodeBase from "./NodeBase";
import type { SceneObjectBaseInterface } from "./Types";
import TransformProps from "../../Renderer/Properties/TransformProps";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";

export class SceneObjectBase extends NodeBase implements SceneObjectBaseInterface {
  components: SceneObjectComponent[] = []

  objects: SceneObjectBase[] = [];

  transformProps: TransformPropsInterface = new TransformProps();

  sceneNode = new SceneNode();

  parent: SceneObjectBase | null = null;

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

  delete(): void {
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

  async addObject(object: SceneObjectBase): Promise<void> {
    return runInAction(async () => {
      this.objects = [
        ...this.objects,
        object,
      ];

      object.parent = this;
      this.sceneNode.addNode(object.sceneNode)

      this.onChange();
    })
  }

  removeObject(object: SceneObjectBase) {
    const index = this.objects.findIndex((o) => o === object)

    if (index !== -1) {
      runInAction(() => {
        this.objects = [
          ...this.objects.slice(0, index),
          ...this.objects.slice(index + 1),
        ]

        this.sceneNode.removeNode(object.sceneNode)

        this.onChange();
      })
    }
  }

  detachSelf() {
    if (this.parent) {
      this.parent.removeObject(this);
    }
  }

  changeName(name: string) {
    runInAction(() => {
      this.name = name;
      this.onChange();
    })
  }

  isAncestor(item: SceneObjectBase): boolean {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let child: SceneObjectBase | null = this;
    for (;;) {
      if (child === null || child.parent === item) {
        break;
      }

      child = child.parent;
    }

    if (child) {
      return true;
    }

    return false;
  }

  getNextComponentId(): number {
    const nextComponentId = this.nextComponentId;
    this.nextComponentId += 1;

    return nextComponentId;    
  }

  transformChanged = () => {
    vec3.copy(this.transformProps.translate.get(), this.sceneNode.translate)
    vec3.copy(this.transformProps.scale.get(), this.sceneNode.scale)

    this.onChange();
  }

  toDescriptor(): object {
    throw new Error('not implemented')
  }
}

