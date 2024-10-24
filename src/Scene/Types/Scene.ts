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
          if (obj.modifierNodeId != null) {
            // Find modifier node and add the object modifier
            // to the map of object modifiers using the node id as the key
            const modifiderNode = scene.nodes.get(obj.modifierNodeId)

            if (isModifierNode(modifiderNode)) {
              let pathMap = modifiderNode.objects.get(obj.nodeId)

              if (pathMap === undefined) {
                pathMap = new Map()
                modifiderNode.objects.set(obj.nodeId, pathMap)
              }

              if (obj.pathId != null) {
                pathMap.set(obj.pathId, { descriptor: obj })
              }
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

    type StackEntry = {
      nodeId: number,
      parent?: TreeNode,
      modifiers: { modifier: ModifierNode, node?: TreeNode }[],
      parentModifierNode?: TreeNode,
    }

    let stack: StackEntry[] = [{
      nodeId: rootNodeId,
      modifiers: [],
    }]

    while (stack.length > 0) {
      const { nodeId, parent, modifiers, parentModifierNode } = stack[0]
      stack = stack.slice(1)

      const descriptor = this.nodes.get(nodeId)

      if (descriptor) {
        if (isModifierNode(descriptor)) {
          stack.push({
            nodeId: descriptor.rootNodeId,
            parent,
            modifiers: [...modifiers, { modifier: descriptor }],
            parentModifierNode,
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
          let pathId = 0;
          for (let i = modifiers.length - 1; i >= 0; i -= 1) {
            const modifier = modifiers[i].modifier

            let pathMap = modifier.objects.get(descriptor.id)

            if (pathMap === undefined) {
              pathMap = new Map()
              modifier.objects.set(descriptor.id, pathMap)
            }

            let o = pathMap.get(pathId)

            if (o === undefined) {
              o = { descriptor: undefined, object: undefined }
              pathMap.set(pathId, o)
            }

            if (o.object === undefined) {
              o.object = await SceneObject.fromDescriptor(o.descriptor, object)
            }

            if (o.object === undefined) {
              throw new Error('object not defined')
            }

            o.object.modifierNode = modifier
            object = o.object

            pathId ^= modifier.id
          }

          let modifierNode: ModifierNode | undefined
          if (modifiers.length > 0 && modifiers[modifiers.length - 1].node === undefined) {
            modifierNode = modifiers[modifiers.length - 1].modifier
          }

          if (object == null) {
            throw new Error('object not set')
          }

          const node = this.createNode(
            descriptor.id,
            descriptor.name,
            object,
            modifierNode,
            parentModifierNode,
            parent,
          )

          if (modifierNode) {
            modifiers[modifiers.length - 1].node = node
          }

          if (root === undefined) {
            root = node
          }

          if (descriptor.children) {
            stack.push(...descriptor.children.map((child) => ({
              nodeId: child,
              parent: node,
              modifiers,
            })))
          }

          // Push onto the stack any nodes added through modifier nodes...
          pathId = 0;
          for (let i = modifiers.length - 1; i >= 0; i -= 1) {
            const modifier = modifiers[i].modifier

            const added = modifier.addedNodes?.find((addedNode) => {
              return (addedNode?.parentNodeId === node.id && addedNode?.pathId === pathId)
            })

            if (added) {
              // Remove from the stack of modifiers the current modifier
              // and the ones following
              if (isModifierNode(added)) {
                stack.push({
                  nodeId: added.rootNodeId,
                  parent,
                  modifiers: [
                    ...modifiers.slice(0, i),
                    { modifier: added },
                  ],
                  parentModifierNode: modifiers[i].node,
                })
              } else {
                stack.push({
                  nodeId: added.nodeId,
                  parent: node,
                  modifiers: modifiers.slice(0, i),
                  parentModifierNode: modifiers[i].node,
                })
              }
            }

            pathId ^= modifier.id
          }
        }
      }
    }

    return root;
  }

  createNode(
    id: number,
    name: string,
    object: SceneObjectInterface,
    modifierNode?: ModifierNode,
    parentModifierNode?: TreeNode,
    parent?: TreeNode,
  ): TreeNode {
    const node = new TreeNode(this, name)

    runInAction(() => {
      node.id = id;
      node.modifications = modifierNode
      node.parentModifierNode = parentModifierNode
      node.nodeObject = object;
    })

    if (parent) {
      parent.autosave = false;
      parent.addNode(node)
      parent.autosave = true;
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
