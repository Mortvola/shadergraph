import { observable, runInAction } from 'mobx';
import { store } from '../../State/store';
import Http from '../../Http/src';
import { isTreeNodeDescriptor, type SceneDescriptor } from './Types';
import type {
  ItemResponse,
  ModificationEntry,
  NodeId,
  NodesResponse2, SceneId, SceneInterface, SceneItemType, SceneObjectDescriptor,
  SceneObjectInterface, SceneObjectModifications, TreeNodeDescriptor,
} from './Types';
import SceneNode from './SceneNode';
import SceneObject, { type ComponentMap } from './SceneObject';
import ModifierNode from './ModifierNode';
import { isModifierNode } from './ModifierNode';
import ProjectItem from '../../Project/Types/ProjectItem';
import { type FolderInterface } from '../../Project/Types/types';
import {
  type ComponentPropsDescriptor,
  ComponentType,
} from '../../Renderer/Types';
import type PropsBase from '../../Renderer/Properties/PropsBase';

type ModifierNodeEntry = { modifier: ModifierNode, node?: SceneNode }

class Scene implements SceneInterface {
  id: number;

  name: string = '';

  @observable
  accessor rootStack: SceneNode[] = []

  @observable
  accessor root: SceneNode | undefined

  private renderedScene: SceneNode | undefined

  @observable
  accessor selectedNode: SceneNode | null = null;

  draggingNode: SceneNode | null = null;

  private nodes: Map<SceneId, Map<NodeId, TreeNodeDescriptor | ModifierNode>> = new Map()

  private objects: Map<number, {
    descriptor: SceneObjectDescriptor,
    components: ComponentMap,
    nodes: SceneNode[],
  }> = new Map()

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

  private processNodeResponse(response: NodesResponse2, parent?: SceneNode) {
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
      const components = new Map()

      for (const component of response.components) {
        if (component.sceneObjectId === obj.id) {
          components.set(component.type, component.props)
        }
      }

      this.objects.set(obj.id, { descriptor: obj, components, nodes:[] })
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
    if (type === ComponentType.Self) {
      const response = await Http.patch<Omit<unknown, 'id'>, void>(
        `/api/scene-objects/${sceneObjectId}`,
        descriptor,
      );

      if (response.ok) {
        const object = this.objects.get(sceneObjectId)

        if (object === undefined) {
          throw new Error('object not found')
        }

        object.descriptor = descriptor as SceneObjectDescriptor
      }
    } else {
      const response = await Http.patch(`/api/components/${sceneObjectId}/${type}`, descriptor)

      if (response.ok) {
        const object = this.objects.get(sceneObjectId)

        if (object === undefined) {
          throw new Error('object not found')
        }

        const component = object.components.get(type)

        if (component === undefined) {
          throw new Error('component not found')
        }

        object.components.set(type, descriptor)
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

  getModifiers(start: SceneNode | undefined) {
    const modifiers: { modifier: ModifierNode, node?: SceneNode }[] = []

    let node: SceneNode | undefined = start

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

  private getParentModifierNode(nodeId: number, parent: SceneNode, modifiers: ModifierNodeEntry[]) {
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
    const object = this.objects.get(id)

    if (object) {
      return SceneObject.fromDescriptor(object.descriptor, object.components)
    }
  }

  async createTree(rootNodeId: number, rootSceneId: number, parent?: SceneNode) {
    let root: SceneNode | undefined;

    type StackEntry = {
      nodeId: number,
      sceneId: number,
      parent?: SceneNode,
      modifiers: ModifierNodeEntry[],
      parentModifierNode?: SceneNode,
    }

    const modifiers = this.getModifiers(parent)

    let stack: StackEntry[] = [{
      nodeId: rootNodeId,
      sceneId: rootSceneId,
      parent,
      modifiers,
      parentModifierNode: parent ? this.getParentModifierNode(rootNodeId, parent, modifiers) : undefined,
    }]

    // Clear the objects array in each entry
    // TODO: Do we need to do this or can we identify
    // each node in the tree using the xor'd node id and modifier node id?
    for (const [, entry] of this.objects) {
      entry.nodes = []
    }

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
          // Get the object entry from the map of objects
          // If the entry was found but the object has not yet
          // been created then create the object and store it in
          // the map entry.
          const o = this.objects.get(descriptor.sceneObjectId)

          if (o === undefined) {
            throw new Error('object entry not found')
          }

          const object = SceneObject.fromDescriptor(o.descriptor, o.components)

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

          o.nodes.push(node)

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

  private rebuildSceneObject(sceneObject: SceneObjectInterface, componentType: ComponentType) {
    // Rebuild scene object using new descriptor and modifications
    const object = this.objects.get(sceneObject.id)

    if (object === undefined) {
      throw new Error('object not found')
    }

    for (const node of object.nodes) {
      node.sceneObject.autosave = false

      if (componentType === ComponentType.Self) {
        node.sceneObject.updateComponent(componentType, object.descriptor.name, false)
      } else {
        const descriptor = object.components.get(componentType)

        if (descriptor === undefined) {
          throw new Error('descriptor not found')
        }

        node.sceneObject.updateComponent(componentType, descriptor, false)
      }

      let n: SceneNode | undefined = node.sceneRoot;

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

      node.sceneObject.autosave = true
    }
  }

  private static deleteOverride(mod: ModificationEntry, componentType: ComponentType, propertyPath?: string) {
    if (componentType === ComponentType.Self) {
      if (propertyPath === undefined) {
        delete mod.sceneObject['name']
      } else {
        delete mod.sceneObject[propertyPath]
      }
    } else {
      if (propertyPath === undefined) {
        delete mod.sceneObject[componentType]
      } else {
        const comp = mod.sceneObject[componentType]

        if (typeof comp !== 'object') {
          throw new Error('component not found')
        }

        delete comp[propertyPath]

        // If there are no properties left then delete the whole component from the modifications.
        const names = Object.getOwnPropertyNames(comp)
        if (names.length === 0) {
          delete mod.sceneObject[componentType]
        }
      }

      // TODO: Remove the modification entry if there are no components left
      // in the sceneObject.
    }
  }

  private async revertOverride(
    node: SceneNode,
    modifierNode: ModifierNode,
    componentType: ComponentType,
    propertyPath?: string,
  ) {
    const pathId = node.getPathId(modifierNode)
    const srcMod = modifierNode.getModificationEntry(pathId)

    // Delete the component from the scene object or
    // the property from the scene object.
    Scene.deleteOverride(srcMod, componentType, propertyPath)

    const payload = {
      modifierNodeId: modifierNode.id,
      sceneId: modifierNode.sceneId,
      pathId,
      modifications: srcMod.sceneObject,
    }

    const response = await Http.put('/api/node-modifications', payload)

    if (response.ok) {
      /* nothing */
    }

    this.rebuildSceneObject(node.sceneObject, componentType)
  }

  private async applyOverride(
    node: SceneNode,             // The node to apply the overrides to
    modifierNode: ModifierNode, // The overrides
    componentType: ComponentType,
    propertyPath?: string,
  ) {
    node.sceneObject.autosave = false;

    const pathId = node.getPathId(modifierNode)

    const srcMod = modifierNode.getModificationEntry(pathId)

    if (componentType === ComponentType.Self) {
      const object = this.objects.get(node.sceneObject.id)

      if (object === undefined) {
        throw new Error('object not found')
      }

      const mod = (srcMod.sceneObject[componentType] as unknown)
      node.sceneObject.name.set(mod as string, false)

      object.descriptor = node.sceneObject.toDescriptor(false) as SceneObjectDescriptor

      const updatedModifications: SceneObjectModifications = {
        ...srcMod.sceneObject,
      }

      delete updatedModifications['name']

      const payload = {
        modifierNodeId: modifierNode.id,
        sceneId: modifierNode.sceneId,
        pathId,
        modifications: updatedModifications,
      }

      const response = await Http.put('/api/node-modifications', payload)

      if (response.ok) {
        runInAction(() => {
          srcMod.sceneObject = updatedModifications
        })
      }

      // If there are no properties left then delete the whole component from the modifications.
      // const names = Object.getOwnPropertyNames(comp)
      // if (names.length === 0) {
      //   delete srcMod.sceneObject[componentType]
      // }

      this.rebuildSceneObject(node.sceneObject, componentType)
    } else {
      const component = node.sceneObject.components[componentType];

      if (component) {
        const object = this.objects.get(node.sceneObject.id)

        if (object === undefined) {
          throw new Error('object not found')
        }

        const descriptor = object.components.get(componentType)

        if (descriptor === undefined) {
          throw new Error('descriptor not found')
        }

        let mod = srcMod.sceneObject[componentType]

        if (typeof mod === 'object') {
          if (propertyPath) {
            mod = {
              [propertyPath]: mod[propertyPath],
            }
          }

          node.sceneObject.updateComponent(componentType, descriptor, false)
          node.sceneObject.updateComponent(componentType, mod, false)

          const component = node.sceneObject.components[componentType]
          const newDescriptor = component.toDescriptor(false)

          if (newDescriptor === undefined) {
            throw new Error('new descriptor is undefined')
          }

          // TODO: Save the new descriptor to the database.

          object.components.set(componentType, newDescriptor)

          // Delete the component from the scene object or
          // the property from the scene object.
          Scene.deleteOverride(srcMod, componentType, propertyPath)

          this.rebuildSceneObject(node.sceneObject, componentType)
        }
      }
    }

    node.sceneObject.autosave = true;
  }

  private async applyAsOverride(
    root: SceneNode,
    node: SceneNode,
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

  getApplyTargets(node: SceneNode, componentType: ComponentType, propertyPath?: string) {
    const t: { label: string, action: () => void, }[] = []

    const root = node.getTopLevelModifierNode()

    if (root === undefined) {
      throw new Error('root is not defiend')
    }

    t.push({
      label: 'Revert Override',
      action: () => this.revertOverride(node, root.modifierNode!, componentType, propertyPath),
    })

    let n: SceneNode | undefined = node.sceneRoot;

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

  async createPrefab(node: SceneNode, folder: FolderInterface) {
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

      const projectItem = new ProjectItem<SceneNode>(
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

  async instantiatePrefab(subSceneId: number, parent: SceneNode) {
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
    parentModifierNode?: SceneNode,
    parent?: SceneNode,
  ): SceneNode {
    const node = new SceneNode(id, sceneId, object, this)

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

  setSelected(node: SceneNode | null) {
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

  removeNode(node: SceneNode) {
    const nodes = this.getNodesMap(node.sceneId)

    nodes.delete(node.id)

    node.detachSelf()
  }

  async addChild(
    component: { type: ComponentType, props: PropsBase } | undefined,
    name: string,
    parent: SceneNode,
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
      const parent: SceneNode | undefined = this.selectedNode ?? this.root

      if (parent) {
        parent.newItemType = type;
      }
    })
  }
}

export default Scene;
