import { vec3 } from "wgpu-matrix";
import { observable, runInAction } from "mobx";
import type { NewSceneNodeComponent, SceneNodeComponent, TransformPropsInterface } from "../../Renderer/Types";
import ObjectBase from "./ObjectBase";
import type { SceneNodeBaseInterface } from "./Types";
import TransformProps from "../../Renderer/Properties/TransformProps";
import RenderNode from "../../Renderer/Drawables/SceneNodes/RenderNode";

export class SceneNodeBase extends ObjectBase implements SceneNodeBaseInterface {
  @observable
  accessor components: SceneNodeComponent[] = []

  @observable
  accessor nodes: SceneNodeBase[] = [];

  parent: SceneNodeBase | null = null;

  transformProps: TransformPropsInterface = new TransformProps();

  renderNode = new RenderNode();

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
  addComponent(_component: NewSceneNodeComponent) {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeComponent(_component: SceneNodeComponent) {
    throw new Error('not implemented')
  }

  async addObject(object: SceneNodeBase): Promise<void> {
    return runInAction(async () => {
      this.nodes = [
        ...this.nodes,
        object,
      ];

      object.parent = this;
      this.renderNode.addNode(object.renderNode)

      this.onChange();
    })
  }

  removeObject(object: SceneNodeBase) {
    const index = this.nodes.findIndex((o) => o === object)

    if (index !== -1) {
      runInAction(() => {
        this.nodes = [
          ...this.nodes.slice(0, index),
          ...this.nodes.slice(index + 1),
        ]

        this.renderNode.removeNode(object.renderNode)

        this.onChange();
      })
    }
  }

  detachSelf() {
    if (this.parent) {
      this.parent.removeObject(this);
      this.parent = null;
    }
  }

  changeName(name: string) {
    runInAction(() => {
      this.name = name;
      this.onChange();
    })
  }

  isAncestor(item: SceneNodeBase): boolean {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let child: SceneNodeBase | null = this;
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
    vec3.copy(this.transformProps.translate.get(), this.renderNode.translate)
    vec3.copy(this.transformProps.scale.get(), this.renderNode.scale)

    this.onChange();
  }

  isPrefabInstanceRoot(): boolean {
    return false;
  }

  toDescriptor(): object {
    return {}    
  }
}

