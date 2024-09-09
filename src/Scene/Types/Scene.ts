import { observable, runInAction } from "mobx";
import { store } from "../../State/store";
import Http from "../../Http/src";
import { type SceneDescriptor } from "./Types";
import type { SceneInterface } from "./Types";
import Tree from "./Tree";
import { objectManager } from "./ObjectManager";
import type TreeNode from "./TreeNode";

class Scene implements SceneInterface {
  id: number = -1;

  name: string = '';

  @observable
  accessor tree: Tree = new Tree()

  @observable
  accessor selectedNode: TreeNode | null = null;

  draggingNode: TreeNode | null = null;

  static async fromDescriptor(descriptor?: SceneDescriptor) {
    const scene = new Scene();

    if (descriptor) {
      scene.id = descriptor.id;
      scene.name = descriptor.name;

      scene.tree = await objectManager.getTree(descriptor.scene.tree);
    }

    return scene;
  }

  toDescriptor(): SceneDescriptor {
    return ({
      id: this.tree.id,
      name: this.tree.name,
      scene: {
        tree: this.tree.id,
      }
    })
  }

  setSelectedObject(node: TreeNode) {
    runInAction(() => {
      this.selectedNode = node;
    })
  }

  async renderScene() {
    store.mainView.addSceneNode(this.tree.root.renderNode);
  }

  addNode(node: TreeNode) {
    this.tree.root.addNode(node)
  }

  saveChanges = async () => {
    if (this.tree.id === undefined) {
      await Http.post('/api/scenes', this.toDescriptor())  
    }
    else {
      await Http.patch(`/api/scenes/${this.tree.id}`, this.toDescriptor())  
    }
  }
}

export default Scene;
