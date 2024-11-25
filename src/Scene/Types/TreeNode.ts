import { computed, observable, runInAction } from 'mobx';
import RenderNode from '../../Renderer/Drawables/SceneNodes/RenderNode';
import {
  type SceneObjectInterface, type SceneInterface, type SceneItemType,
  type ModificationEntry,
} from './Types';
import type ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';
import type LightProps from '../../Renderer/Properties/LightProps';
import {
  ComponentType,
  type TransformPropsInterface,
  type LightInterface,
  type ParticleSystemInterface,
} from '../../Renderer/Types';
import ParticleSystem from '../../Renderer/ParticleSystem/ParticleSystem';
import { vec3 } from 'wgpu-matrix';
import Http from '../../Http/src';
import type ModifierNode from './ModifierNode';

type NodeComponent = {
  type: ComponentType,
  props: ParticleSystemProps | LightProps,
  component: ParticleSystemInterface | LightInterface,
}

type ParentDescriptor = {
  parentNodeId: number | null,
  modifierNodeId: number | null,
  pathId: number | null,
}

class TreeNode {
  id: number;

  sceneId: number;

  @observable
  accessor children: TreeNode[] = [];

  parent?: TreeNode;

  get modifierNodeId(): number | undefined {
    if (this.parent?.modifierNode !== undefined) {
      return this.parent.modifierNode.id
    }

    return this.parent?.modifierNodeId
  }

  get sceneRoot(): TreeNode {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode | undefined = this;
    let root: TreeNode = this.scene.root!

    while (node) {
      if (node.modifierNode) {
        root = node
        break;
      }

      node = node.parentModifierNode?.parent ?? node.parent
    }

    return root;
  }

  @observable
  accessor modifierNode: ModifierNode | undefined;

  @computed
  get hasOverrides(): boolean {
    if (this.modifierNode) {
      for (const [, mod] of this.modifierNode.modifications) {
        if (mod.addedNodes.length > 0 || Object.getOwnPropertyNames(mod.sceneObject).length > 0) {
          return true
        }
      }

      return false
    }

    return false
  }

  private _sceneObject: SceneObjectInterface;

  get sceneObject(): SceneObjectInterface {
    return this._sceneObject
  }

  // set nodeObject(object: SceneObjectInterface) {
  //   this._sceneObject = object
  //   object.node = this;

  //   this.getComponentProps()
  //   this.transformChanged()
  // }

  renderNode = new RenderNode();

  scene: SceneInterface;

  @observable
  accessor parentModifierNode: TreeNode | undefined;

  get isModifierRoot(): boolean {
    return this.modifierNode !== undefined
  }

  @observable
  accessor newItemType: SceneItemType | undefined = undefined;

  autosave = true;

  get isAddedNode(): boolean {
    return this.parent !== undefined && this.actualSceneId !== this.parent.sceneId
  }

  get isTopLevel(): boolean {
    return this.actualSceneId === this.scene.root?.sceneId
  }

  constructor(id: number, sceneId: number, object: SceneObjectInterface, scene: SceneInterface) {
    this.id = id;
    this.sceneId = sceneId;

    this._sceneObject = object
    this._sceneObject.node = this;

    this.scene = scene;

    this.getComponentProps()
    this.transformChanged()
  }

  isAncestor(node: TreeNode): boolean {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let child: TreeNode | undefined = this;
    for (;;) {
      if (child === undefined || child.parent === node) {
        break;
      }

      child = child.parent;
    }

    if (child) {
      return true;
    }

    return false;
  }

  addNode(node: TreeNode) {
    runInAction(() => {
      node.detachSelf()

      this.children = [
        ...this.children,
        node,
      ];

      node.parent = this;
      this.renderNode.addNode(node.renderNode)

      // this.onChange();
    })
  }

  removeNode(node: TreeNode) {
    const index = this.children.findIndex((o) => o === node)

    if (index !== -1) {
      runInAction(() => {
        this.children = [
          ...this.children.slice(0, index),
          ...this.children.slice(index + 1),
        ]

        this.renderNode.removeNode(node.renderNode)

        // this.onChange();
      })
    }
  }

  get actualNodeId(): number {
    // If there is a tree ID associated with this node but the parent
    // does not have the same associate then we must be at the root
    // of a tree. Therefore, update the node with the tree id instead the node with id.
    if (this.modifierNode !== undefined) {
      return this.modifierNode.id;
    }

    return this.id
  }

  get actualSceneId(): number {
    // If there is a tree ID associated with this node but the parent
    // does not have the same associate then we must be at the root
    // of a tree. Therefore, update the node with the tree id instead the node with id.
    if (this.modifierNode !== undefined) {
      return this.modifierNode.sceneId;
    }

    return this.sceneId
  }

  getPathId(modifierNode: ModifierNode) {
    let id = 0

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode | undefined = this

    while (node !== undefined) {
      if (node.modifierNode?.id === modifierNode.id) {
        break;
      }

      if (node.modifierNode !== undefined) {
        id ^= node.modifierNode.id
      }

      node = node.parentModifierNode?.parent ?? node.parent
    }

    return id ^ this.id
  }

  getTopLevelModifierNode(): TreeNode | undefined {
    let modifierNode: TreeNode | undefined

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode | undefined = this;

    for (;;) {
      if (node === undefined) {
        break;
      }

      if (node.modifierNode !== undefined) {
        modifierNode = node
      }

      // If we have reached an added node then break
      // out of the loop.
      node = node.parentModifierNode?.parent ?? node.parent
    }

    return modifierNode
  }

  getParentDescriptor(): { descriptor: ParentDescriptor, modifierNode: TreeNode | undefined } {
    let descriptor: ParentDescriptor = {
      parentNodeId: this.id,
      modifierNodeId: null,
      pathId: null,
    }

    let newPath: number

    const node = this.getTopLevelModifierNode()
    if (node) {
      if (node.modifierNode === undefined) {
        throw new Error('node.modifierNOde is not set')
      }

      newPath = this.getPathId(node.modifierNode)

      descriptor = {
        parentNodeId: null,
        modifierNodeId: node.modifierNode?.id ?? null,
        pathId: newPath,
      }
    }

    return { descriptor, modifierNode: node };
  }

  async reparent(newParent: TreeNode) {
    if (!this.isTopLevel) {
      throw new Error('Cannot move nodes not at top level')
    }

    if (this.parent === undefined) {
      throw new Error('Cannot reparent root nodes')
    }

    const { descriptor: previousParent } = this.parent.getParentDescriptor()
    const { descriptor: parent, modifierNode: newModifierNode } = newParent.getParentDescriptor()

    const payload = {
      previousParent,
      ...parent,
    }

    const response = await Http.patch<unknown, (ModificationEntry & { sceneId: number, nodeId: number })[]>(
      `/api/tree-nodes/${this.actualSceneId}/${this.actualNodeId}`,
      payload,
    )

    if (response.ok) {
      const body = await response.body()

      runInAction(() => {
        this.scene.processModifications(body)

        this.parentModifierNode = newModifierNode

        newParent.addNode(this);
      })
    }
  }

  async applyConnectionOverride(parentWrapperId?: number): Promise<void> {
    if (this.parent) {
      const response = await Http.patch<unknown, void>(`/api/tree-nodes/${this.actualSceneId}/${this.actualNodeId}`, {
        parentNodeId: this.parent.id,
        parentWrapperId: parentWrapperId ?? null,
      })

      if (response.ok) {
        // const body = await response.body()

        // const parentNodeInfo = this.scene.nodeMaps.get(this.parent.id)
        // const nodeInfo = this.scene.nodeMaps.get(this.id)

        // if (parentNodeInfo && nodeInfo) {
        //   for (const [wrapperId, treeNode] of parentNodeInfo.treeNodes) {
        //     if (wrapperId !== this.parent.modifierNodeId && this.parent !== treeNode) {
        //       this.scene.createNode(
        //         this.id,
        //         this.sceneId,
        //         undefined, // nodeInfo,
        //         this.modifierNode,
        //         this.parentModifierNode,
        //         treeNode,
        //       )
        //     }
        //   }
        // }
      }
    }
  }

  private getComponentProps() {
    // const stack: SceneObjectInterface[] = [];
    const object: SceneObjectInterface | undefined = this._sceneObject;

    // Generate array of object derivations so that we can work
    // backwards from the base object to the most recent derivation.
    // while (nodeObject) {
    //   stack.push(nodeObject)

    //   nodeObject = nodeObject.baseObject;
    // }

    const components: Map<string, NodeComponent> = new Map();

    // while (stack.length > 0) {
    //   const object = stack.pop();

      if (object) {
        for (const type in object.components) {
          const comp = object.components[type]

          switch (type) {
            case ComponentType.ParticleSystem: {
              // const props = new ParticleSystemProps(
              //   undefined,
              //   comp.props as ParticleSystemProps,
              // );
              const props = comp as ParticleSystemProps;

              const ps = new ParticleSystem(props)

              components.set(`${object.id}:${type}`, {
                type,
                props,
                component: ps,
              })

              break;
            }

            case ComponentType.Light: {
            //   const light = new Light(c.props as LightPropsInterface);

            //   // object.renderNode.addComponent(light)

            //   return {
            //     id: c.id,
            //     type: c.type,
            //     props: c.props,
            //     object: light,
            //     node: object,
            //   }
            // }
            }
          }
        }
      }
    // }

    // this.components = components;

    for (const [, component] of components) {
      this.renderNode.addComponent(component.component)
    }
  }

  detachSelf() {
    if (this.parent) {
      this.parent.removeNode(this);
      this.parent = undefined;
    }
  }

  async delete() {
    const response = await Http.delete(`/api/tree-nodes/${this.actualSceneId}/${this.actualNodeId}`);

    if (response.ok) {
      runInAction(() => {
        this.scene.removeNode(this)
      })
    }
  }

  async onChange() {
    if (this.autosave) {
      // await sceneManager.update(this);
    }
  }

  transformChanged() {
    const transform = this.sceneObject.components[ComponentType.Transform] as TransformPropsInterface

    if (transform) {
      vec3.copy(transform.translate.get(), this.renderNode.translate)
      this.renderNode.setFromAngles(
        transform.rotate.get()[0],
        transform.rotate.get()[1],
        transform.rotate.get()[2],
      )
      vec3.copy(transform.scale.get(), this.renderNode.scale)
    }
  }

  changeName(name: string) {
    runInAction(() => {
      this.sceneObject.header.name.set(name, true)
    })
  }

  cancelNewItem() {
    runInAction(() => {
      this.newItemType = undefined;
    })
  }

  @computed
  get connectionOverrides(): TreeNode[] {
    const connections: TreeNode[] = [];

    if (this.isModifierRoot) {
      let stack: TreeNode[] = [this];

      while (stack.length > 0) {
        const node = stack[0];
        stack = stack.slice(1)

        for (const child of node.children) {
          if (child.isTopLevel && child.parentModifierNode !== undefined) {
            connections.push(child)
          }

          stack.push(child)
        }
      }
    }

    return connections;
  }
}

export default TreeNode;
