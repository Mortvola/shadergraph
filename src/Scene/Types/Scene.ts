import { observable, runInAction } from 'mobx';
import { store } from '../../State/store';
import Http from '../../Http/src';
import { isTreeNodeDescriptor, type SceneDescriptor } from './Types';
import type {
  ItemResponse,
  NodeInfo, NodesResponse2, SceneInterface, SceneItemType, SceneObjectDescriptor,
  SceneObjectInterface, TreeNodeDescriptor,
} from './Types';
import TreeNode from './TreeNode';
import SceneObject from './SceneObject';
import ModifierNode from './ModifierNode';
import { isModifierNode } from './ModifierNode';
import ProjectItem from '../../Project/Types/ProjectItem';
import { type FolderInterface } from '../../Project/Types/types';

class Scene implements SceneInterface {
  id: number = -1;

  name: string = '';

  @observable
  accessor rootStack: TreeNode[] = []

  @observable
  accessor root: TreeNode | undefined

  private renderedScene: TreeNode | undefined

  @observable
  accessor selectedNode: TreeNode | null = null;

  draggingNode: TreeNode | null = null;

  // Map of nodes index by node id and then tree id
  nodeMaps: Map<number, NodeInfo> = new Map()

  nodes: Map<number, TreeNodeDescriptor | ModifierNode> = new Map()

  objects: Map<number, { descriptor: SceneObjectDescriptor, object?: SceneObjectInterface }> = new Map()

  private processNodeResponse(response: NodesResponse2) {
    for (const node of response.nodes) {
      // TODO: consider updating the node in the map
      if (!this.nodes.has(node.id)) {
        if (isTreeNodeDescriptor(node)) {
          this.nodes.set(node.id, node)
        } else {
          this.nodes.set(node.id, new ModifierNode(node))
        }
      }
    }

    for (const obj of response.objects) {
      if (obj.modifierNodeId != null) {
        // Find modifier node and add the object modifier
        // to the map of object modifiers using the node id as the key
        const modifiderNode = this.nodes.get(obj.modifierNodeId)

        if (isModifierNode(modifiderNode)) {
          let pathMap = modifiderNode.objects.get(obj.nodeId)

          if (pathMap === undefined) {
            pathMap = new Map()
            modifiderNode.objects.set(obj.nodeId, pathMap)
          }

          if (obj.pathId != null && !pathMap.has(obj.pathId)) {
            pathMap.set(obj.pathId, { descriptor: obj })
          }
        }
      } else if (!this.objects.has(obj.nodeId)) {
        this.objects.set(obj.nodeId, { descriptor: obj })
      }
    }
  }

  static async fromDescriptor(descriptor?: SceneDescriptor) {
    const scene = new Scene();

    if (descriptor) {
      scene.id = descriptor.id;
      scene.name = descriptor.name;

      const response = await Http.get<NodesResponse2>(`/api/tree-nodes/${descriptor.rootNodeId}`)

      if (response.ok) {
        const body = await response.body();

        scene.processNodeResponse(body)

        scene.pushTree(body.rootNodeId)
      }
    }

    return scene;
  }

  getModifiers(start: TreeNode | undefined) {
    const modifiers: { modifier: ModifierNode, node?: TreeNode }[] = []

    let node: TreeNode | undefined = start

    for(;;) {
      if (node == null) {
        break;
      }

      if (node.modifications != null) {
        modifiers.push({
          modifier: node.modifications,
          node,
        })
      }

      if (node.parentModifierNode != null) {
        node = node.parentModifierNode.parent
      }
      else {
        node = node.parent
      }
    }

    return modifiers
  }

  async createTree(rootNodeId: number, parent?: TreeNode) {
    let root: TreeNode | undefined;

    type StackEntry = {
      nodeId: number,
      parent?: TreeNode,
      modifiers: { modifier: ModifierNode, node?: TreeNode }[],
      parentModifierNode?: TreeNode,
    }

    const modifiers = this.getModifiers(parent)

    let stack: StackEntry[] = [{
      nodeId: rootNodeId,
      parent,
      modifiers,
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

  async pushTree(nodeId: number) {
    const tree = await this.createTree(nodeId)

    if (tree) {
      runInAction(() => {
        this.rootStack = [...this.rootStack, tree]
        this.root = this.rootStack[this.rootStack.length - 1]
      })
    }
  }

  async popTree() {
    if (this.rootStack.length > 1) {
      runInAction(() => {
        this.rootStack = this.rootStack.slice(0, this.rootStack.length - 1)
      })

      // Rebuild the tree to make sure any changes are picked up.
      const tree = await this.createTree(this.rootStack[this.rootStack.length - 1].id)

      runInAction(() => {
        if (tree) {
          this.rootStack[this.rootStack.length - 1] = tree
        }

        this.root = this.rootStack[this.rootStack.length - 1]
      })
    }
  }

  async createPrefab(node: TreeNode, folder: FolderInterface) {
    let path: { id: number, path: number[] } | undefined

    if (node.parent != null && node?.modifications !== undefined) {
      path = node.parent.getPathId(node.modifications)
    }

    const response = await Http.post<unknown, ItemResponse>('/api/tree-nodes/tree', {
      folderId: folder.id,
      nodeId: node.modifierNodeId ?? node.id,
      modifierNodeId: node.modifications?.id ?? null,
      path: path?.path ?? null,
      pathId: path?.id ?? null,
    })

    if (response.ok) {
      const body = await response.body();

      const projectItem = new ProjectItem<TreeNode>(
        body.item.id, body.item.name, body.item.type, folder, node.id,
      );

      projectItem.item = node;

      folder.addItem(projectItem)

      const parent = node.parent;
      node.detachSelf()

      this.processNodeResponse(body)
      this.createTree(body.rootNodeId, parent)
    }
  }

  async instantiatePrefab(rootNodeId: number, parent: TreeNode) {
    const modifierNode = parent.getTopLevelModifierNode()

    let path: { id: number, path: number[] } | undefined

    if (modifierNode?.modifications !== undefined) {
      path = parent.getPathId(modifierNode.modifications)
    }

    const payload = {
      parentNodeId: parent.id,
      modifierNodeId: modifierNode?.modifications?.id ?? null,
      path: path?.path ?? null,
      pathId: path?.id ?? null,
      rootNodeId: rootNodeId,
    }

    const response = await Http.post<unknown, NodesResponse2>('/api/tree-nodes', payload)

    if (response.ok) {
      const body = await response.body();

      this.processNodeResponse(body)
      this.createTree(body.rootNodeId, parent)
    }
  }

  createNode(
    id: number,
    object: SceneObjectInterface,
    modifierNode?: ModifierNode,
    parentModifierNode?: TreeNode,
    parent?: TreeNode,
  ): TreeNode {
    const node = new TreeNode(id, this)

    runInAction(() => {
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
      rootNodeId: this.rootStack[0].id,
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
    this.removeScene()

    if (this.root) {
      store.mainView.addSceneNode(this.root.renderNode);
      store.mainView.clock.restart();

      this.renderedScene = this.root
    }
  }

  removeScene() {
    if (this.renderedScene) {
      store.mainView.removeSceneNode(this.renderedScene.renderNode)
      this.renderedScene = undefined
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
      const parent: TreeNode | undefined = this.selectedNode ?? this.root

      if (parent) {
        parent.newItemType = type;
      }
    })
  }
}

export default Scene;
