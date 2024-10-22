import { observable, runInAction } from 'mobx';
import { store } from '../../State/store';
import Http from '../../Http/src';
import { type SceneDescriptor } from './Types';
import type {
  NodeInfo, NodesResponse2, SceneInterface, SceneItemType, SceneObjectDescriptor,
  SceneObjectInterface, TreeId, TreeNodeDescriptor,
} from './Types';
import TreeNode from './TreeNode';
import SceneObject from './SceneObject';

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

  nodes: Map<number, TreeNodeDescriptor> = new Map()

  objects: Map<TreeId | undefined, Map<number, { descriptor: SceneObjectDescriptor, object?: SceneObjectInterface }>> = new Map()

  static async fromDescriptor(descriptor?: SceneDescriptor) {
    const scene = new Scene();

    if (descriptor) {
      scene.id = descriptor.id;
      scene.name = descriptor.name;

      const response = await Http.get<NodesResponse2>(`/api/tree-nodes/${descriptor.rootNodeId}`)

      if (response.ok) {
        const body = await response.body();

        for (const node of body.nodes) {
          scene.nodes.set(node.id, node)
        }

        for (const obj of body.objects) {
          let nodeObjects = scene.objects.get(obj.treeId ?? undefined)

          if (nodeObjects === undefined) {
            nodeObjects = new Map()
            scene.objects.set(obj.treeId ?? undefined, nodeObjects)
          }

          nodeObjects.set(obj.nodeId, { descriptor: obj })
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

    let stack: { nodeId: number, parent?: TreeNode, wrappers: TreeNodeDescriptor[], wrapperId?: number }[] = [{
      nodeId: rootNodeId,
      wrappers: [],
    }]

    while (stack.length > 0) {
      const { nodeId, parent, wrappers, wrapperId } = stack[0]
      stack = stack.slice(1)

      const descriptor = this.nodes.get(nodeId)

      if (descriptor) {
        if (descriptor.rootNodeId === undefined) {
          let object: SceneObjectInterface | undefined
          const objects = this.objects.get(undefined)
          if (objects) {
            const o = objects.get(descriptor.id)

            if (o) {
              if (o.object === undefined) {
                o.object = await SceneObject.fromDescriptor(o.descriptor)
              }

              object = o.object
            }

            for (let i = wrappers.length - 1; i >= 0; i -= 1) {
              const objects = this.objects.get(wrappers[i].id)

              if (objects) {
                const o = objects.get(descriptor.id)

                if (o) {
                  if (o.object === undefined) {
                    o.object = await SceneObject.fromDescriptor(o.descriptor, object)
                  }

                  object = o.object
                }
              }
            }
          }

          const node = this.createNode(
            descriptor.id,
            descriptor.name,
            object,
            wrapperId,
            descriptor.parentWrapperId,
            descriptor.pathId,
            descriptor.path,
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
            const added = wrappers[i].addedNodes?.find((addedId) => {
              const a = this.nodes.get(addedId)

              if (a?.parentNodeId === node.id && a?.pathId === pathId) {
                return true
              }
            })

            if (added) {
              stack.push({ nodeId: added, parent: node, wrappers })
            }

            pathId ^= wrappers[i].id
          }
        } else {
          stack.push({
            nodeId: descriptor.rootNodeId,
            parent,
            wrappers: [...wrappers, descriptor],
            wrapperId: descriptor.id,
          })
        }
      }
    }

    return root;
  }

  createNode(
    id: number,
    name: string,
    object?: SceneObjectInterface,
    wrapperId?: number,
    parentWrapperId?: number,
    pathId?: number,
    path?: number[],
    parent?: TreeNode,
  ): TreeNode {
    const node = new TreeNode(this, name)

    runInAction(() => {
      node.id = id;
      node.wrapped = wrapperId
      node.parentWrapperId = parentWrapperId
      node.pathId = pathId
      node.path = path?.slice()
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
