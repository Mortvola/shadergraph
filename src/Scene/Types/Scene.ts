import { observable, runInAction } from 'mobx';
import { store } from '../../State/store';
import Http from '../../Http/src';
import { isTreeNodeDescriptor, type SceneDescriptor } from './Types';
import type {
  ItemResponse,
  ModificationEntry,
  NodeId,
  NodesResponse2, SceneId, SceneInterface, SceneItemType, SceneObjectDescriptor,
  SceneObjectInterface, TreeNodeDescriptor,
} from './Types';
import TreeNode from './TreeNode';
import SceneObject from './SceneObject';
import ModifierNode from './ModifierNode';
import { isModifierNode } from './ModifierNode';
import ProjectItem from '../../Project/Types/ProjectItem';
import { type FolderInterface } from '../../Project/Types/types';
import { type ComponentType, type ComponentDescriptor } from '../../Renderer/Types';
import type PropsBase from '../../Renderer/Properties/PropsBase';

type ModifierNodeEntry = { modifier: ModifierNode, node?: TreeNode }

class Scene implements SceneInterface {
  id: number;

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
  // nodeMaps: Map<number, NodeInfo> = new Map()

  private nodes: Map<SceneId, Map<NodeId, TreeNodeDescriptor | ModifierNode>> = new Map()

  private objects: Map<number, { descriptor: SceneObjectDescriptor, object?: SceneObjectInterface }> = new Map()

  components: Map<number, ComponentDescriptor> = new Map()

  constructor(id: number) {
    this.id = id
  }

  processModifications(modifications: (ModificationEntry & { sceneId: number, nodeId: number })[]) {
    for (const mod of modifications) {
      const modNode = this.getNode(mod.nodeId, mod.sceneId)

      if (isModifierNode(modNode)) {
        for (const modification of modifications) {
          modNode.modifications.set(modification.pathId, {
            pathId: modification.pathId,
            sceneObject: modification.sceneObject,
            addedNodes: modification.addedNodes,
          })
        }
      }
    }
  }

  private getNodesMap(sceneId: number) {
    let nodeMap = this.nodes.get(sceneId)

    if (nodeMap === undefined) {
      nodeMap = new Map()
      this.nodes.set(sceneId, nodeMap)
    }

    return nodeMap;
  }

  private getNode(nodeId: number, sceneId: number) {
    const nodeMap = this.getNodesMap(sceneId)

    return nodeMap.get(nodeId)
  }

  private processNodeResponse(response: NodesResponse2, parent?: TreeNode) {
    for (const node of response.nodes) {
      const nodesMap = this.getNodesMap(node.sceneId)

      // TODO: consider updating the node in the map
      if (!this.nodes.has(node.id)) {
        if (isTreeNodeDescriptor(node)) {
          nodesMap.set(node.id, node)
        } else {
          const modNode = new ModifierNode(node)
          nodesMap.set(node.id, modNode)
        }
      }
    }

    for (const obj of response.objects) {
      this.objects.set(obj.id, { descriptor: obj })
    }

    for (const component of response.components) {
      this.components.set(component.id, component)
    }

    if (response.modifications) {
      this.processModifications(response.modifications)
    }

    if (response.deletedNodes) {
      for (const deletedNode of response.deletedNodes) {
        const nodesMap = this.getNodesMap(deletedNode.sceneId)

        nodesMap.delete(deletedNode.id)
      }
    }

    // If there is a parent node and the scene IDs match then
    // add the root to the parent's list of children
    if (parent && response.root.sceneId === parent.sceneId) {
      const parentNode = this.getNode(parent.id, parent.sceneId)

      if (isTreeNodeDescriptor(parentNode)) {
        parentNode.children?.push(response.root.id)
      }
    }
  }

  static async fromDescriptor(descriptor: SceneDescriptor) {
    const scene = new Scene(descriptor.id);

    scene.name = descriptor.name;

    const response = await Http.get<NodesResponse2>(
      `/api/tree-nodes/${descriptor.id}/${descriptor.rootNodeId}`,
    )

    if (response.ok) {
      const body = await response.body();

      scene.processNodeResponse(body)

      scene.pushTree(body.root.id, body.root.sceneId)
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

      if (node.modifierNode != null) {
        modifiers.push({
          modifier: node.modifierNode,
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

    modifiers.reverse()

    return modifiers
  }

  private getParentModifierNode(nodeId: number, parent: TreeNode, modifiers: ModifierNodeEntry[]) {
    let pathId = 0;
    for (let i = modifiers.length - 1; i >= 0; i -= 1) {
      const modifier = modifiers[i].modifier

      const { addedNodes } = modifier.getModificationEntry(parent.id ^ pathId);

      if (addedNodes.some((id) => id === nodeId)) {
        return modifiers[i].node
      }

      pathId ^= modifier.id
    }
  }

  async createTree(rootNodeId: number, rootSceneId: number, parent?: TreeNode) {
    let root: TreeNode | undefined;

    type StackEntry = {
      nodeId: number,
      sceneId: number,
      parent?: TreeNode,
      modifiers: ModifierNodeEntry[],
      parentModifierNode?: TreeNode,
    }

    const modifiers = this.getModifiers(parent)

    let stack: StackEntry[] = [{
      nodeId: rootNodeId,
      sceneId: rootSceneId,
      parent,
      modifiers,
      parentModifierNode: parent ? this.getParentModifierNode(rootNodeId, parent, modifiers) : undefined,
    }]

    while (stack.length > 0) {
      const { nodeId, sceneId, parent, modifiers, parentModifierNode } = stack[0]
      stack = stack.slice(1)

      const descriptor = this.getNode(nodeId, sceneId)

      if (descriptor) {
        if (isModifierNode(descriptor)) {
          stack.push({
            nodeId: descriptor.rootNodeId,
            sceneId: descriptor.rootSceneId,
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
          const o = this.objects.get(descriptor.sceneObjectId)

          if (o) {
            if (o.object === undefined) {
              o.object = await SceneObject.fromDescriptor(o.descriptor, this.components)
            }

            object = o.object
          }

          if (object == null) {
            throw new Error('object not set')
          }

          // Find any object modifiers in the modifider nodes
          // and apply the modifications.
          let pathId = 0;
          for (let i = modifiers.length - 1; i >= 0; i -= 1) {
            const modifier = modifiers[i].modifier

            object = await modifier.getObject(descriptor.id ^ pathId, object)

            pathId ^= modifier.id
          }

          let modifierNodeEntry: ModifierNodeEntry | undefined
          if (modifiers.at(-1)?.node === undefined) {
            modifierNodeEntry = modifiers.at(-1)
          }

          const node = this.createNode(
            descriptor.id,
            descriptor.sceneId,
            object,
            modifierNodeEntry?.modifier,
            parentModifierNode,
            parent,
          )

          if (modifierNodeEntry) {
            modifierNodeEntry.node = node
          }

          if (root === undefined) {
            root = node
          }

          if (descriptor.children) {
            stack.push(...descriptor.children.map((child) => ({
              nodeId: child,
              sceneId: descriptor.sceneId,
              parent: node,
              modifiers,
            })))
          }

          // Push onto the stack any nodes added through modifier nodes...
          pathId = 0;
          for (let i = modifiers.length - 1; i >= 0; i -= 1) {
            const modifier = modifiers[i].modifier

            const { addedNodes } = modifier.getModificationEntry(nodeId ^ pathId);

            for (const addedNodeId of addedNodes) {
              const added = this.getNode(addedNodeId, modifier.sceneId)

              if (added !== undefined) {
                // Remove from the stack of modifiers the current modifier
                // and the ones following
                if (isModifierNode(added)) {
                  stack.push({
                    nodeId: added.rootNodeId,
                    sceneId: added.rootSceneId,
                    parent: node,
                    modifiers: [
                      ...modifiers.slice(0, i),
                      { modifier: added },
                    ],
                    parentModifierNode: modifiers[i].node,
                  })
                } else {
                  stack.push({
                    nodeId: added.id,
                    sceneId: added.sceneId,
                    parent: node,
                    modifiers: modifiers.slice(0, i),
                    parentModifierNode: modifiers[i].node,
                  })
                }
              }
            }

            pathId ^= modifier.id
          }
        }
      }
    }

    return root;
  }

  async pushTree(nodeId: number, sceneId: number) {
    const tree = await this.createTree(nodeId, sceneId)

    if (tree) {
      runInAction(() => {
        this.rootStack = [...this.rootStack, tree]
        this.root = this.rootStack.at(-1)
      })
    }
  }

  async popTree() {
    if (this.rootStack.length > 1) {
      runInAction(() => {
        this.rootStack = this.rootStack.slice(0, this.rootStack.length - 1)
      })

      // Rebuild the tree to make sure any changes are picked up.
      const tree = await this.createTree(
        this.rootStack[this.rootStack.length - 1].id,
        this.rootStack[this.rootStack.length - 1].sceneId,
      )

      runInAction(() => {
        if (tree) {
          this.rootStack[this.rootStack.length - 1] = tree
        }

        this.root = this.rootStack.at(-1)
      })
    }
  }

  async createPrefab(node: TreeNode, folder: FolderInterface) {
    if (node.parent === undefined) {
      throw new Error('no parent set')
    }

    const { descriptor: parentDescriptor, modifierNode } = node.parent.getParentDescriptor()

    const payload = {
      folderId: folder.id,
      nodeId: node.modifierNodeId ?? node.id,
      ...parentDescriptor,
    }

    const sceneId = modifierNode?.modifierNode?.sceneId ?? node.sceneId

    const response = await Http.post<unknown, ItemResponse>(`/api/tree-nodes/tree/${sceneId}`, payload)

    if (response.ok) {
      const body = await response.body();

      const projectItem = new ProjectItem<TreeNode>(
        body.item.id, body.item.name, body.item.type, folder, node.id,
      );

      projectItem.item = node;

      folder.addItem(projectItem)

      const parent = node.parent;
      node.detachSelf()

      this.processNodeResponse(body, parent)
      this.createTree(body.root.id, body.root.sceneId, parent)
    }
  }

  async instantiatePrefab(subSceneId: number, parent: TreeNode) {
    const { descriptor: parentDescriptor, modifierNode } = parent.getParentDescriptor()

    const payload = {
      ...parentDescriptor,
      subSceneId,
    }

    const sceneId = modifierNode?.modifierNode?.sceneId ?? parent.sceneId

    const response = await Http.post<unknown, NodesResponse2>(`/api/tree-nodes/${sceneId}`, payload)

    if (response.ok) {
      const body = await response.body();

      this.processNodeResponse(body, parent)
      this.createTree(body.root.id, body.root.sceneId, parent)
    }
  }

  private createNode(
    id: number,
    sceneId: number,
    object: SceneObjectInterface,
    modifierNode?: ModifierNode,
    parentModifierNode?: TreeNode,
    parent?: TreeNode,
  ): TreeNode {
    const node = new TreeNode(id, sceneId, object, this)

    runInAction(() => {
      node.modifierNode = modifierNode
      node.parentModifierNode = parentModifierNode
    })

    if (parent) {
      // parent.autosave = false;
      parent.addNode(node)
      // parent.autosave = true;
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

  removeNode(node: TreeNode) {
    const nodes = this.getNodesMap(node.sceneId)

    nodes.delete(node.id)

    node.detachSelf()
  }

  async addChild(
    component: { type: ComponentType, props: PropsBase } | undefined,
    name: string,
    parent: TreeNode,
  ) {
    const { descriptor: parentDescriptor, modifierNode } = parent.getParentDescriptor()

    const payload = {
      ...parentDescriptor,
      name,
      component: component
        ? {
          type: component.type,
          props: component.props.toDescriptor(),
        }
        : undefined,
    }

    const sceneId = modifierNode?.modifierNode?.sceneId ?? parent.sceneId

    const response = await Http.post<unknown, NodesResponse2>(`/api/scene-objects/${sceneId}`, payload);

    if (response.ok) {
      const body = await response.body();

      this.processNodeResponse(body, parent)

      const subtree = this.createTree(body.root.id, body.root.sceneId, parent)

      return subtree
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
