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
import {
  type ComponentDescriptor,
  type ComponentPropsDescriptor,
  ComponentType,
} from '../../Renderer/Types';
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

  private nodes: Map<SceneId, Map<NodeId, TreeNodeDescriptor | ModifierNode>> = new Map()

  private objects: Map<number, { descriptor: SceneObjectDescriptor, object?: SceneObjectInterface }> = new Map()

  components: Map<string, ComponentDescriptor> = new Map()

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
      this.components.set(`${component.sceneObjectId}:${component.type}`, component)
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

  async updateObjectComponent(sceneObjectId: number, type: ComponentType, descriptor: ComponentPropsDescriptor) {
    const response = await Http.patch(`/api/components/${sceneObjectId}/${type}`, descriptor)

    if (response.ok) {
      const component = this.components.get(`${sceneObjectId}:${type}`)

      if (component) {
        component.props = descriptor
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

      node = node.parentModifierNode?.parent ?? node.parent
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

  getObject(id: number) {
    const descriptor = this.objects.get(id)?.descriptor

    if (descriptor) {
      return SceneObject.fromDescriptor(descriptor, this.components)
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
            // if (o.object === undefined) {
              object = await SceneObject.fromDescriptor(o.descriptor, this.components)
            // }

            // object = o.object
          }

          if (object == null) {
            throw new Error('object not set')
          }

          // Find any object modifiers in the modifider nodes
          // and apply the modifications.
          let pathId = 0;
          for (let i = modifiers.length - 1; i >= 0; i -= 1) {
            const modifier = modifiers[i].modifier

            const mods = modifier.getModificationEntry(descriptor.id ^ pathId);
            object.applyModifications(mods.sceneObject, i === 0)

            // object = await modifier.getObject(descriptor.id ^ pathId, object)

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

  private rebuildSceneObject(node: TreeNode, componentType: ComponentType) {
    // Rebuild scene object using new descriptor and modifications
    let n: TreeNode | undefined = node.sceneRoot;
    while (n) {
      if (n.modifierNode) {
        const mods = n.modifierNode.getModificationEntry(node.getPathId(n.modifierNode));

        const componentMod = mods.sceneObject[componentType]

        if (componentMod) {
          node.sceneObject.updateComponent(componentType, componentMod, true)
        }
      }

      n = (n.parentModifierNode?.parent ?? n.parent)?.sceneRoot
    }
  }

  private async applyOverride(
    node: TreeNode,             // The node to apply the overrides to
    modifierNode: ModifierNode, // The overrides
    componentType: ComponentType,
    propertyPath?: string,
  ) {
    const srcMod = modifierNode.getModificationEntry(node.getPathId(modifierNode))

    if (componentType === ComponentType.Self) {
      const object = this.objects.get(node.sceneObject.id)

      if (object === undefined) {
        throw new Error('object not found')
      }

      const mod = (srcMod.sceneObject[componentType] as unknown)
      node.sceneObject.header.name.set(mod as string, false)

      object.descriptor = node.sceneObject.toDescriptor(false)

      delete srcMod.sceneObject[componentType]

      // If there are no properties left then delete the whole component from the modifications.
      // const names = Object.getOwnPropertyNames(comp)
      // if (names.length === 0) {
      //   delete srcMod.sceneObject[componentType]
      // }
    } else {
      const component = node.sceneObject.components[componentType];

      if (component) {
        const descriptor = this.components.get(`${node.sceneObject.id}:${componentType}`)

        if (descriptor?.props) {
          let mod = srcMod.sceneObject[componentType]

          if (mod) {
            if (propertyPath) {
              mod = {
                [propertyPath]: mod[propertyPath],
              }
            }

            node.sceneObject.updateComponent(componentType, descriptor.props, false)
            node.sceneObject.updateComponent(componentType, mod, false)

            const component = node.sceneObject.components[componentType]
            const newDescriptor = component.props.toDescriptor(false)

            // TODO: Save the new descriptor to the database.

            descriptor.props = newDescriptor

            // Delete the component from the scene object or
            // the property from the scene object.
            if (propertyPath === undefined) {
              delete srcMod.sceneObject[componentType]
            } else {
              const comp = srcMod.sceneObject[componentType]
              delete comp[propertyPath]

              // If there are no properties left then delete the whole component from the modifications.
              const names = Object.getOwnPropertyNames(comp)
              if (names.length === 0) {
                delete srcMod.sceneObject[componentType]
              }
            }

            // TODO: Remove the modification entry if there are no components left
            // in the sceneObject.

            this.rebuildSceneObject(node, componentType)
          }
        }
      }
    }
  }

  private async applyAsOverride(
    root: TreeNode,
    node: TreeNode,
    modifierNode: ModifierNode,
    componentType: ComponentType,
    propertyPath?: string,
  ) {
    if (root.modifierNode === undefined) {
      throw new Error('modifier node not set')
    }

    const srcMod = root.modifierNode.getModificationEntry(node.getPathId(root.modifierNode))
    const destMod = modifierNode.getModificationEntry(node.getPathId(modifierNode))

    const payload = {
      modifierNodeId: modifierNode.id,
      sceneId: modifierNode.sceneId,
      pathId: destMod.pathId,
      source: {
        modifierNodeId: root.modifierNode.id,
        sceneId: root.modifierNode.sceneId,
        pathId: srcMod.pathId,
        key: componentType,
      },
    }

    const response = await Http.put('/api/node-modifications', payload)

    if (response.ok) {
      runInAction(() => {
        destMod.sceneObject = {
          ...destMod.sceneObject,
          [componentType]: srcMod.sceneObject[componentType],
        }

        delete srcMod.sceneObject[componentType]
      })

      console.log(JSON.stringify(destMod.sceneObject))
    }
  }

  getApplyTargets(node: TreeNode, componentType: ComponentType, propertyPath?: string) {
    const t: { label: string, action: () => void, }[] = []

    const root = node.getTopLevelModifierNode()

    if (root === undefined) {
      throw new Error('root is not defiend')
    }

    let n: TreeNode | undefined = node.sceneRoot;

    while (n) {
      if (n.sceneRoot.sceneId === node.sceneId) {
        const base = this.objects.get(node.sceneObject.id)

        if (base === undefined) {
          throw new Error('object not found')
        }

        t.push({
          label: `Apply to ${base.descriptor.name}`,
          action: () => { this.applyOverride(node, root.modifierNode!, componentType, propertyPath) },
        })
      } else if (n.modifierNode) {
        // If we reached a modifier node in the top level scene then
        // we don't need to look any further.
        if (n.modifierNode.sceneId === n.scene.root?.sceneId) {
          break;
        }

        const object = this.objects.get(n.sceneRoot.sceneObject.id)

        if (object === undefined) {
          throw new Error('object not defined')
        }

        const modifierNode = n.modifierNode

        t.push({
          label: `Apply as override in ${object.descriptor.name}`,
          action: () => { this.applyAsOverride(root, node, modifierNode, componentType, propertyPath) },
        })
      }

      n = (n.parentModifierNode?.parent ?? n.parent)?.sceneRoot
    }

    return t.reverse();
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
          props: component.props.toDescriptor(false),
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
