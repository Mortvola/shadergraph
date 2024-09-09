import { observable, runInAction } from "mobx";
import RenderNode from "../../Renderer/Drawables/SceneNodes/RenderNode";
import { getNextObjectId } from "../../State/Entity";
import { objectManager } from "./ObjectManager";
import SceneNode from "./SceneNode";
import { ObjectType, type TreeNodeDescriptor } from "./Types";
import ObjectBase from "./ObjectBase";

class TreeNode extends ObjectBase {
  @observable
  accessor nodes: TreeNode[] = [];

  parent?: TreeNode;

  nodeObject: SceneNode;

  renderNode: RenderNode;

  constructor() {
    super(getNextObjectId(), '')

    this.nodeObject = new SceneNode()
    this.renderNode = new RenderNode();
  }

  static async fromDescriptor(descriptor: TreeNodeDescriptor) {
    const treeNode = new TreeNode()

    treeNode.id = descriptor.id;

    treeNode.nodes = (await Promise.all(descriptor.object.nodes.map(async (nodeId) => {
      return objectManager.getTreeNode(nodeId)
    })))
      .filter((n) => n !== undefined)

    for (const child of treeNode.nodes) {
      child.parent = treeNode
    }

    treeNode.nodeObject = await objectManager.getSceneNode(descriptor.object.objectId) ?? treeNode.nodeObject

    return treeNode;
  }

  toDescriptor(): TreeNodeDescriptor | Omit<TreeNodeDescriptor, 'id'> {
    return {
      id: this.id >= 0 ? this.id : undefined,
      name: this.name,
      object: {
        type: ObjectType.TreeNode,
        nodes: this.nodes.map((node) => node.id),
        objectId: this.nodeObject.id,
      }    
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

      this.onChange();
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

        this.onChange();
      })
    }
  }

  detachSelf() {
    if (this.parent) {
      this.parent.removeNode(this);
      this.parent = undefined;
    }
  }

  async delete() {
    await objectManager.delete(this);
  }

  onChange() {
    objectManager.update(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeName(name: string) {

  }
}

export default TreeNode;
