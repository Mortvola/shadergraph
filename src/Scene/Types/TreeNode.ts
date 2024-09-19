import { observable, runInAction } from "mobx";
import RenderNode from "../../Renderer/Drawables/SceneNodes/RenderNode";
import { getNextObjectId } from "../../State/Entity";
import { type SceneItemType, type TreeNodeDescriptor } from "./Types";
import ObjectBase from "./ObjectBase";
import type ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import type LightProps from "../../Renderer/Properties/LightProps";
import { ComponentType, type LightInterface, type ParticleSystemInterface } from "../../Renderer/Types";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import { vec3 } from "wgpu-matrix";
import { sceneManager } from "./SceneManager";
import Http from "../../Http/src";
import SceneObject from "./SceneObject";

type NodeComponent = {
  type: ComponentType,
  props: ParticleSystemProps | LightProps,
  component: ParticleSystemInterface | LightInterface,
}

class TreeNode extends ObjectBase {
  @observable
  accessor nodes: TreeNode[] = [];

  components: Map<number, NodeComponent> = new Map();

  parent?: TreeNode;

  private _nodeObject = new SceneObject();

  get nodeObject(): SceneObject {
    return this._nodeObject
  }

  set nodeObject(object: SceneObject) {
    this._nodeObject = object
    this.getComponentProps()
    vec3.copy(this.nodeObject.transformProps.translate.get(), this.renderNode.translate)
    vec3.copy(this.nodeObject.transformProps.scale.get(), this.renderNode.scale)
  }

  renderNode = new RenderNode();

  @observable
  accessor newItemType: SceneItemType | undefined = undefined;

  treeId?: number;

  autosave = true;

  constructor() {
    super(getNextObjectId(), '')
  }

  static async fromDescriptor(descriptor: TreeNodeDescriptor) {
    const treeNode = new TreeNode()

    treeNode.id = descriptor.id;

    // treeNode.nodes = (await Promise.all(descriptor.object.nodes.map(async (nodeId) => (
    //   objectManager.getTreeNode(nodeId)
    // ))))
    //   .filter((n) => n !== undefined)

    // treeNode.nodeObject = await objectManager.getSceneObject(descriptor.object.objectId) ?? treeNode.nodeObject
    treeNode.nodeObject.treeNode = treeNode;

    for (const child of treeNode.nodes) {
      child.parent = treeNode
      treeNode.renderNode.addNode(child.renderNode)
    }

    return treeNode;
  }

  toDescriptor(): TreeNodeDescriptor | Omit<TreeNodeDescriptor, 'id'> {
    return {
      id: this.id >= 0 ? this.id : undefined,
      treeId: 0,
      parentNodeId: 0,
      // subtreeId: 0,
      // name: this.name,
      // object: {
      //   type: ObjectType.TreeNode,
      //   nodes: this.nodes.map((node) => node.id),
      //   objectId: this.nodeObject.id,
      // }    
    }
  }

  isAncestor(node: TreeNode): boolean {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let child: TreeNode | undefined = this;
    for (;;) {
      if (child === undefined || child.parent === node) {
        break;
      }

      child = child.parent;
    }

    if (child) {
      return true;
    }

    return false;
  }

  async addNode(node: TreeNode): Promise<void> {
    return runInAction(async () => {
      this.nodes = [
        ...this.nodes,
        node,
      ];

      node.parent = this;
      this.renderNode.addNode(node.renderNode)

      // this.onChange();
    })
  }

  removeNode(node: TreeNode) {
    const index = this.nodes.findIndex((o) => o === node)

    if (index !== -1) {
      runInAction(() => {
        this.nodes = [
          ...this.nodes.slice(0, index),
          ...this.nodes.slice(index + 1),
        ]

        this.renderNode.removeNode(node.renderNode)

        // this.onChange();
      })
    }
  }

  private getComponentProps() {
    const stack: SceneObject[] = [];
    let nodeObject: SceneObject | undefined = this._nodeObject;

    // Generate array of object derivations so that we can work
    // backwards from the base object to the most recent derivation.
    while (nodeObject) {
      stack.push(nodeObject)

      nodeObject = nodeObject.baseObject;
    }

    const components: Map<number, NodeComponent> = new Map();

    while (stack.length > 0) {
      const object = stack.pop();

      if (object) {
        for (const comp of object.components) {
          switch (comp.type) {
            case ComponentType.ParticleSystem: {    
              // const props = new ParticleSystemProps(
              //   undefined,
              //   comp.props as ParticleSystemProps,
              // );
              const props = comp.props as ParticleSystemProps;
    
              const ps = new ParticleSystem(props)
    
              components.set(comp.id, {
                type: comp.type,
                props,
                component: ps,
              })

              break;
            }
    
            case ComponentType.Light: {
            //   const light = new Light(c.props as LightPropsInterface);
    
            //   // object.renderNode.addComponent(light)
    
            //   return {
            //     id: c.id,
            //     type: c.type,
            //     props: c.props,
            //     object: light,
            //     node: object,
            //   }
            // }
            }
          }
        }
      }
    }

    this.components = components;

    for (const [, component] of this.components) {
      this.renderNode.addComponent(component.component)
    }
  }

  detachSelf() {
    if (this.parent) {
      this.parent.removeNode(this);
      this.parent = undefined;
    }
  }

  async delete() {
    const response = await Http.delete(`/api/tree-nodes/${this.treeId ?? this.id}`);

    if (response.ok) {
      runInAction(() => {
        this.detachSelf()
      })
    }
  }

  async onChange() {
    if (this.autosave) {
      await sceneManager.update(this);
    }
  }

  transformChanged() {
    vec3.copy(this.nodeObject.transformProps.translate.get(), this.renderNode.translate)
    vec3.copy(this.nodeObject.transformProps.scale.get(), this.renderNode.scale)
  }

  changeName(name: string) {
    this.nodeObject.changeName(name)
  }

  cancelNewItem() {
    runInAction(() => {
      this.newItemType = undefined;
    })
  }
}

export default TreeNode;
