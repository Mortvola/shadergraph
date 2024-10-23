import { observable, runInAction } from 'mobx';
import { store } from '../../State/store';
import Http from '../../Http/src';
import { isTreeNodeDescriptor, type SceneDescriptor } from './Types';
import type {
  NodeInfo, NodesResponse2, SceneInterface, SceneItemType, SceneObjectDescriptor,
  SceneObjectInterface, TreeNodeDescriptor,
} from './Types';
import TreeNode from './TreeNode';
import SceneObject from './SceneObject';
import ModifierNode from './ModifierNode';
import { isModifierNode } from './ModifierNode';

class Scene implements SceneInterface {
  id: number = -1;

  name: string = '';

  @observable
  accessor root: TreeNode | undefined

  @observable
  accessor tempRoot: TreeNode | undefined

  @observable
  accessor selectedNode: TreeNode | null = null;

  draggingNode: TreeNode | null = null;

  // Map of nodes index by node id and then tree id
  nodeMaps: Map<number, NodeInfo> = new Map()

  nodes: Map<number, TreeNodeDescriptor | ModifierNode> = new Map()

  objects: Map<number, { descriptor: SceneObjectDescriptor, object?: SceneObjectInterface }> = new Map()

  static async fromDescriptor(descriptor?: SceneDescriptor) {
    const scene = new Scene();

    if (descriptor) {
      scene.id = descriptor.id;
      scene.name = descriptor.name;

      const response = await Http.get<NodesResponse2>(`/api/tree-nodes/${descriptor.rootNodeId}`)

      if (response.ok) {
        const body = await response.body();

        for (const node of body.nodes) {
          if (isTreeNodeDescriptor(node)) {
            scene.nodes.set(node.id, node)
          } else {
            scene.nodes.set(node.id, new ModifierNode(node))
          }
        }

        for (const obj of body.objects) {
          if (obj.treeId != null) {
            // Find modifier node and add the object modifier
            // to the map of object modifiers using the node id as the key
            const modifiderNode = scene.nodes.get(obj.treeId)

            if (isModifierNode(modifiderNode)) {
              modifiderNode.objects.set(obj.nodeId, { descriptor: obj })
            }
          } else {
            scene.objects.set(obj.nodeId, { descriptor: obj })
          }
        }

        scene.root = await scene.createTree(body.rootNodeId)
      }
    }

    return scene;
  }

  // static sortObjectDescriptors(objects: SceneObjectDescriptor[]) {
  //   objects.sort((a, b) => {
  //     if (a.baseTreeId === undefined) {
  //       if (b.baseTreeId === undefined) {
  //         return 0
  //       }

  //       return -1;
  //     }

  //     if (b.baseTreeId === undefined) {
  //       return 1;
  //     }

  //     if (a.baseTreeId === b.treeId) {
  //       return 1;
  //     }

  //     if (b.baseTreeId === a.treeId) {
  //       return -1;
  //     }

  //     return 0;
  //   })
  // }

  // async loadObjects(objects: SceneObjectDescriptor[], trees?: { id: number, name: string }[]) {
  //   for (const object of objects) {
  //     if (object.nodeId !== undefined) {
  //       let nodeInfo = this.nodeMaps.get(object.nodeId)

  //       if (nodeInfo === undefined) {
  //         nodeInfo = { treeNodes: new Map(), objects: new Map() }
  //         this.nodeMaps.set(object.nodeId, nodeInfo)
  //       }

  //       let baseObject: SceneObjectInterface | undefined = undefined;

  //       if (object.treeId !== undefined) {
  //         baseObject = nodeInfo.objects.get(object.baseTreeId)

  //         if (baseObject === undefined) {
  //           console.log('base object not instantiated')
  //         }
  //       }

  //       const sceneObject = await SceneObject.fromDescriptor(object, baseObject)
  //       sceneObject.tree = trees?.find((tree) => tree.id === object.rootId)
  //       nodeInfo.objects.set(object.treeId, sceneObject)
  //     }
  //   }
  // }

  // async treeFromDescriptor(descriptor: NodesResponse): Promise<TreeNode | undefined> {
  //   let root: TreeNode | undefined;

  //   // Sort the objects so that the base objects are instantiated first
  //   Scene.sortObjectDescriptors(descriptor.objects)

  //   await this.loadObjects(descriptor.objects, descriptor.trees)

  //   type StackEntry = {
  //     nodeDescriptor: TreeNodeDescriptor,
  //     parent: TreeNode | undefined,
  //   }

  //   let stack: StackEntry[] = [{ nodeDescriptor: descriptor.root, parent: undefined }]

  //   while (stack.length > 0) {
  //     const { nodeDescriptor, parent } = stack[0]
  //     stack = stack.slice(1)

  //     const nodeInfo = this.nodeMaps.get(nodeDescriptor.id)

  //     if (nodeInfo === undefined) {
  //       throw new Error('node info not found')
  //     }

  //     const node = this.createNode(
  //       nodeDescriptor.id,
  //       nodeDescriptor.name,
  //       undefined, // nodeInfo.objects,
  //       nodeDescriptor.wrapperId,
  //       nodeDescriptor.parentWrapperId,
  //       nodeDescriptor.pathId,
  //       nodeDescriptor.path,
  //       parent,
  //     )

  //     nodeInfo.treeNodes.set(node.topLevelWrapperId, node)

  //     if (root === undefined) {
  //       root = node
  //     }

  //     stack = stack.concat(nodeDescriptor.children.map(
  //       (child) => ({
  //         nodeDescriptor: child,
  //         parent: node,
  //       }))
  //     )
  //   }

  //   return root;
  // }

  async createTree(rootNodeId: number) {
    let root: TreeNode | undefined;

    let stack: { nodeId: number, parent?: TreeNode, wrappers: ModifierNode[], modifierNode?: ModifierNode }[] = [{
      nodeId: rootNodeId,
      wrappers: [],
    }]

    while (stack.length > 0) {
      const { nodeId, parent, wrappers, modifierNode } = stack[0]
      stack = stack.slice(1)

      const descriptor = this.nodes.get(nodeId)

      if (descriptor) {
        if (isModifierNode(descriptor)) {
          stack.push({
            nodeId: descriptor.rootNodeId,
            parent,
            wrappers: [...wrappers, descriptor],
            modifierNode: descriptor,
          })
        } else {
          let object: SceneObjectInterface | undefined

          // Get the object entry from the map of objects
          // If the entry was found but the object has not yet
          // been created then create the object and store it in
          // the map entry.
          const o = this.objects.get(descriptor.id)

          if (o) {
            if (o.object === undefined) {
              o.object = await SceneObject.fromDescriptor(o.descriptor)
            }

            object = o.object
          }

          // Find any object modifiers in the modifider nodes
          // and apply the modifications.
          for (let i = wrappers.length - 1; i >= 0; i -= 1) {
            const o = wrappers[i].objects.get(descriptor.id)

            if (o) {
              if (o.object === undefined) {
                o.object = await SceneObject.fromDescriptor(o.descriptor, object)
              }

              object = o.object
            }
          }

          let parentModifierNode: ModifierNode | undefined
          if (descriptor.parentWrapperId) {
            const node = this.nodes.get(descriptor.parentWrapperId)

            if (isModifierNode(node)) {
              parentModifierNode = node
            }
          }

          const node = this.createNode(
            descriptor.id,
            descriptor.name,
            object,
            modifierNode,
            parentModifierNode,
            parent,
          )

          if (root === undefined) {
            root = node
          }

          if (descriptor.children) {
            stack.push(...descriptor.children.map((child) => ({
              nodeId: child,
              parent: node,
              wrappers,
            })))
          }

          let pathId = 0;
          for (let i = wrappers.length - 1; i >= 0; i -= 1) {
            const added = wrappers[i].addedNodes?.find((addedNode) => {
              const a = this.nodes.get(addedNode.nodeId)

              return (isTreeNodeDescriptor(a) && addedNode?.parentNodeId === node.id && addedNode?.pathId === pathId)
            })

            if (added) {
              stack.push({ nodeId: added.nodeId, parent: node, wrappers })
            }

            pathId ^= wrappers[i].id
          }
        }
      }
    }

    return root;
  }

  createNode(
    id: number,
    name: string,
    object?: SceneObjectInterface,
    modifierNode?: ModifierNode,
    parentModifierNode?: ModifierNode,
    parent?: TreeNode,
  ): TreeNode {
    const node = new TreeNode(this, name)

    runInAction(() => {
      node.id = id;
      node.modifierNode = modifierNode
      node.parentModifierNode = parentModifierNode
    })

    if (parent) {
      parent.autosave = false;
      parent.addNode(node)
      parent.autosave = true;
    }

    if (object) {
      node.nodeObject = object;
    }

    return node
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
