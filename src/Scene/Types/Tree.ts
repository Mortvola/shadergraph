import { getNextObjectId } from "../../State/Entity";
import { objectManager } from "./ObjectManager";
import TreeNode from "./TreeNode";
import { type TreeDescriptor } from "./Types";

export class Tree {
  id: number;

  name: string;

  root: TreeNode;

  constructor(name?: string) {
    this.id = getNextObjectId()
    this.name = name ?? 'Tree';
    this.root = new TreeNode();
  }

  static async fromDescriptor(descriptor: TreeDescriptor) {
    const tree = new Tree();

    tree.id = descriptor.id
    tree.root = await objectManager.getTreeNode(descriptor.object.root) ?? tree.root;

    return tree
  }
}

export default Tree;
