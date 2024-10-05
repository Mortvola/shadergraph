import { observable, runInAction } from "mobx";
import { store } from "../../State/store";
import Http from "../../Http/src";
import { type SceneDescriptor } from "./Types";
import type { NodesResponse, SceneInterface, SceneItemType, SceneObjectDescriptor, TreeId, TreeNodeDescriptor } from "./Types";
import TreeNode from "./TreeNode";
import SceneObject from "./SceneObject";

class Scene implements SceneInterface {
  id: number = -1;

  name: string = '';

  @observable
  accessor root: TreeNode | undefined

  @observable
  accessor selectedNode: TreeNode | null = null;

  draggingNode: TreeNode | null = null;

  // Map of nodes index by node id and then tree id
  nodeMaps: Map<number, { treeNodes: Map<TreeId | undefined, TreeNode>, objects: Map<TreeId | undefined, SceneObject> }> = new Map()

  static async fromDescriptor(descriptor?: SceneDescriptor) {
    const scene = new Scene();

    if (descriptor) {
      scene.id = descriptor.id;
      scene.name = descriptor.name;
      // scene.root = descriptor.treeId;

      const response = await Http.get<NodesResponse>(`/api/tree-nodes/${descriptor.rootNodeId}`)

      if (response.ok) {
        const body = await response.body();

        scene.root = await scene.treeFromDescriptor(body);
      }
    }

    return scene;
  }

  static sortObjectDescriptors(objects: SceneObjectDescriptor[]) {
    objects.sort((a, b) => {
      if (a.baseTreeId === undefined) {
        if (b.baseTreeId === undefined) {
          return 0
        }

        return -1;
      }

      if (b.baseTreeId === undefined) {
        return 1;
      }

      if (a.baseTreeId === b.treeId) {
        return 1;
      }
      
      if (b.baseTreeId === a.treeId) {
        return -1;
      }

      return 0;
    })
  }

  async loadObjects(objects: SceneObjectDescriptor[]) {
    for (const object of objects) {
      if (object.nodeId !== undefined) {
        let nodeInfo = this.nodeMaps.get(object.nodeId)

        if (nodeInfo === undefined) {
          nodeInfo = { treeNodes: new Map(), objects: new Map() }
          this.nodeMaps.set(object.nodeId, nodeInfo)
        }

        let baseObject: SceneObject | undefined = undefined;

        if (object.treeId !== undefined) {
          baseObject = nodeInfo.objects.get(object.baseTreeId)

          if (baseObject === undefined) {
            console.log('base object not instantiated')
          }
        }

        const sceneObject = await SceneObject.fromDescriptor(object, baseObject)
        nodeInfo.objects.set(object.treeId, sceneObject)
      }
    }
  }

  async treeFromDescriptor(descriptor: NodesResponse): Promise<TreeNode | undefined> {
    let root: TreeNode | undefined;
  
    // Sort the objects so that the base objects are instantiated first
    Scene.sortObjectDescriptors(descriptor.objects)

    await this.loadObjects(descriptor.objects)

    type StackEntry = { nodeDescriptor: TreeNodeDescriptor, parent: TreeNode | undefined }
    let stack: StackEntry[] = [{ nodeDescriptor: descriptor.root, parent: undefined }]

    while (stack.length > 0) {
      const { nodeDescriptor, parent } = stack[0]
      stack = stack.slice(1)

      const node = new TreeNode(this)

      node.id = nodeDescriptor.id;
      node.treeId = nodeDescriptor.treeId;

      const nodeInfo = this.nodeMaps.get(node.id)

      if (nodeInfo === undefined) {
        throw new Error('node info not found')
      }

      const object = nodeInfo.objects.get(node.treeId)

      if (object) {
        node.nodeObject = object;
        object.treeNode = node;
      }

      node.name = nodeDescriptor.name ?? 'Unknown Node';

      if (parent) {
        parent.autosave = false;
        parent.addNode(node)
        parent.autosave = true;
      }
      else {
        root = node;
      }

      nodeInfo.treeNodes.set(node.treeId, node)

      stack = stack.concat(nodeDescriptor.children.map((child) => ({ nodeDescriptor: child, parent: node })))
    }

    return root;
  }
  
  toDescriptor(): SceneDescriptor {
    return ({
      id: this.id,
      name: this.name,
      rootNodeId: this.root!.id,
    })
  }

  setSelected(node: TreeNode | null) {
    runInAction(() => {
      this.selectedNode = node;

      if (node) {
        store.selectItem(null);
      }
    })
  }

  renderScene() {
    if (this.root) {
      store.mainView.addSceneNode(this.root.renderNode);
    }
  }

  removeScene() {
    if (this.root) {
      store.mainView.removeSceneNode(this.root.renderNode);
    }
  }

  addNode(node: TreeNode, autosave = true) {
    if (this.selectedNode) {
      this.selectedNode.autosave = autosave
      this.selectedNode.addNode(node)
      this.selectedNode.autosave = true
    }
    else if (this.root) {
      this.root.autosave = autosave
      this.root.addNode(node)
      this.root.autosave = true
    }
    else {
      this.root = node;
    }
  }

  saveChanges = async () => {
    if (this.id < 0) {
      await Http.post('/api/scenes', this.toDescriptor())  
    }
    else {
      await Http.patch(`/api/scenes/${this.id}`, this.toDescriptor())  
    }
  }

  addNewItem(type: SceneItemType) {
    runInAction(() => {
      let parent: TreeNode | undefined = this.selectedNode ?? undefined

      if (parent === null) {
        parent = this.root;
      }

      if (parent) {
        parent.newItemType = type;
      }
    })
  }
}

export default Scene;
