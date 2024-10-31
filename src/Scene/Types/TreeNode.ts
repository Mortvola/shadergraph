import { computed, observable, runInAction } from 'mobx';
import RenderNode from '../../Renderer/Drawables/SceneNodes/RenderNode';
import {
  type SceneObjectInterface, type SceneInterface, type SceneItemType, type SceneObjectDescriptor,
} from './Types';
import type ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';
import type LightProps from '../../Renderer/Properties/LightProps';
import { ComponentType, type LightInterface, type ParticleSystemInterface } from '../../Renderer/Types';
import ParticleSystem from '../../Renderer/ParticleSystem/ParticleSystem';
import { vec3 } from 'wgpu-matrix';
import Http from '../../Http/src';
import SceneObject from './SceneObject';
import type ModifierNode from './ModifierNode';
import type PropsBase from '../../Renderer/Properties/PropsBase';

type NodeComponent = {
  type: ComponentType,
  props: ParticleSystemProps | LightProps,
  component: ParticleSystemInterface | LightInterface,
}

type ParentDescriptor = {
  parentNodeId: number | null,
  modifierNodeId: number | null,
  // nodeId: number | null,
  pathId: number | null,
}

class TreeNode {
  id: number;

  treeId: number;

  @observable
  accessor children: TreeNode[] = [];

  parent?: TreeNode;

  components: Map<number, NodeComponent> = new Map();

  get modifierNodeId(): number | undefined {
    if (this.parent === undefined) {
      return undefined
    }

    if (this.parent.modifierNode !== undefined) {
      return this.parent.modifierNode.id
    }

    return this.parent.modifierNodeId
  }

  @observable
  accessor modifierNode: ModifierNode | undefined;

  private _nodeObject: SceneObjectInterface;

  get nodeObject(): SceneObjectInterface {
    return this._nodeObject
  }

  set nodeObject(object: SceneObjectInterface) {
    this._nodeObject = object
    object.node = this;

    this.getComponentProps()
    this.transformChanged()
  }

  renderNode = new RenderNode();

  scene: SceneInterface;

  @observable
  accessor parentModifierNode: TreeNode | undefined;

  get wrapperRoot(): boolean {
    return this.modifierNode !== undefined
  }

  get withinWrapper(): boolean {
    return this.modifierNodeId !== undefined || this.modifierNode !== undefined
  }

  @observable
  accessor newItemType: SceneItemType | undefined = undefined;

  autosave = true;

  get isTopLevel(): boolean {
    // If the parentModifierNode is set then this is an "add on" node
    // If this is not an "add on" node then use the top level modifier node
    // of this node to determine if it is a top level node.
    // If it is an "add on" node then get the top level modifier node
    // of the parentModifierNode's parent.
    if (this.parentModifierNode === undefined) {
      if (this.modifierNode === undefined) {
        return this.getTopLevelModifierNode() === undefined
      }

      return this.parent?.getTopLevelModifierNode() === undefined
    }

    return this.parentModifierNode.parent?.getTopLevelModifierNode() === undefined
  }

  constructor(id: number, treeId: number, scene: SceneInterface) {
    this.id = id;
    this.treeId = treeId;

    this._nodeObject = new SceneObject()
    this._nodeObject.node = this;

    this.scene = scene;
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

  get actualTreeId(): number {
    // If there is a tree ID associated with this node but the parent
    // does not have the same associate then we must be at the root
    // of a tree. Therefore, update the node with the tree id instead the node with id.
    if (this.modifierNode !== undefined) {
      return this.modifierNode.treeId;
    }

    return this.treeId
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

      node = node.parent
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
      if (node.parentModifierNode !== undefined) {
        node = node.parentModifierNode.parent
      }
      else {
        node = node.parent
      }
    }

    return modifierNode
  }

  getParentDescriptor(): { descriptor: ParentDescriptor, modifierNode: TreeNode | undefined } {
    let descriptor: ParentDescriptor = {
      parentNodeId: this.id,
      modifierNodeId: null,
      // nodeId: null,
      pathId: null,
    }

    let newPath: number

    const modifierNode = this.getTopLevelModifierNode()
    if (modifierNode) {
      if (modifierNode.modifierNode === undefined) {
        throw new Error('modifierNOde.modifierNOde is not set')
      }

      newPath = this.getPathId(modifierNode.modifierNode)

      descriptor = {
        parentNodeId: null,
        modifierNodeId: modifierNode.modifierNode?.id ?? null,
        // nodeId: this.id,
        pathId: newPath,
      }
    }

    return { descriptor, modifierNode };
  }

  async reparent(newParent: TreeNode) {
    if (!this.isTopLevel) {
      throw new Error('Cannot move nodes not at top level')
    }

    if (this.parent === undefined) {
      throw new Error('Cannot reparent root nodes')
    }

    const { descriptor: previousParent, modifierNode: previousModifierNode } = this.parent.getParentDescriptor()
    const { descriptor: parent, modifierNode: newModifierNode } = newParent.getParentDescriptor()

    const payload = {
      previousParent,
      ...parent,
    }

    const response = await Http.patch<unknown, void>(
      `/api/tree-nodes/${this.actualTreeId}/${this.actualNodeId}`,
      payload,
    )

    if (response.ok) {
      runInAction(() => {
        if (this.parent === undefined) {
          throw new Error('Cannot reparent root nodes')
        }

        if (previousModifierNode) {
          if (previousParent.pathId === null) {
            throw new Error('oldPath not set')
          }

          previousModifierNode.modifierNode?.removeAddedNode(previousParent.pathId, this.id)
        }

        if (newModifierNode) {
          if (parent.pathId === null) {
            throw new Error('oldPath not set')
          }

          newModifierNode.modifierNode?.addAddedNode(parent.pathId, this.id)
          this.parentModifierNode = newModifierNode
        }

        // if (this.parentModifierNode?.modifications !== undefined) {
        //   if (this.parentModifierNode.modifications.id !== newModifierNode?.modifications?.id) {
        //     // Changing parent modifier nodes. Remove from the old and
        //     // add to the new (if there is a new one).
        //     const index = this.parentModifierNode.modifications.addedNodes
        //       .findIndex((entry) => entry.nodeId === this.id)

        //     if (index !== -1) {
        //       this.parentModifierNode.modifications.addedNodes = [
        //         ...this.parentModifierNode.modifications.addedNodes.slice(0, index),
        //         ...this.parentModifierNode.modifications.addedNodes.slice(index + 1),
        //       ]
        //     }

        //     // If there is a new modifier node then add
        //     // this node to its list of added nodes.
        //     if (newModifierNode?.modifications !== undefined) {
        //       if (newPath === undefined) {
        //         throw new Error('path not defined')
        //       }

        //       newModifierNode.modifications.addedNodes.push({
        //         nodeId: this.id,
        //         parentNodeId: newParent.id,
        //         pathId: newPath.id,
        //       })
        //     }
        //   } else {
        //     // The node is staying within the addedNodes of the
        //     // same modifier node.

        //     if (newPath === undefined) {
        //       throw new Error('path not defined')
        //     }

        //     // Find the existing node in the addedNodes and update it
        //     const entry = newModifierNode.modifications.addedNodes.find((entry) => entry.nodeId === this.id)

        //     if (entry) {
        //       entry.parentNodeId = newParent.id
        //       entry.pathId = newPath.id
        //     } else {
        //       // For some reason, the node was not found.
        //       // Add it.
        //       console.log(`Node not found in addedNodes: ${newModifierNode.id}, ${this.id}`)

        //       newModifierNode.modifications.addedNodes.push({
        //         nodeId: this.id,
        //         parentNodeId: newParent.id,
        //         pathId: newPath.id,
        //       })
        //     }
        //   }
        // } else if (newModifierNode?.modifications !== undefined) {
        //   // node was not an added ndoe in a modifier node but
        //   // is being added to a modifier node.
        //   if (newPath === undefined) {
        //     throw new Error('path not defined')
        //   }

        //   newModifierNode.modifications.addedNodes.push({
        //     nodeId: this.id,
        //     parentNodeId: newParent.id,
        //     pathId: newPath.id,
        //   })
        // }

        this.parentModifierNode = newModifierNode

        newParent.addNode(this);
      })
    }
  }

  async addChild(
    component: { type: ComponentType, props: PropsBase } | undefined,
    name: string,
  ) {
    const { descriptor: parent, modifierNode } = this.getParentDescriptor()

    const payload = {
      ...parent,
      name,
      component: component
        ? {
          type: component.type,
          props: component.props.toDescriptor(),
        }
        : undefined,
    }

    const treeId = modifierNode?.modifierNode?.treeId ?? this.treeId

    const response = await Http.post<unknown, SceneObjectDescriptor>(`/api/scene-objects/${treeId}`, payload);

    if (response.ok) {
      const descriptor = await response.body();

      const node = new TreeNode(descriptor.nodeId, descriptor.treeId, this.scene)

      node.parentModifierNode = modifierNode;

      const object = await SceneObject.fromDescriptor(descriptor);
      this.scene.objects.set(node.id, { descriptor, object })

      node.nodeObject = object

      this.addNode(node);

      return node
    }
  }

  async applyConnectionOverride(parentWrapperId?: number): Promise<void> {
    if (this.parent) {
      const response = await Http.patch<unknown, void>(`/api/tree-nodes/${this.actualTreeId}/${this.actualNodeId}`, {
        parentNodeId: this.parent.id,
        parentWrapperId: parentWrapperId ?? null,
      })

      if (response.ok) {
        const body = await response.body()

        // if (body.objects) {
          // await this.parent.scene.loadObjects(body.objects, body.trees)
        // }

        runInAction(() => {
          // this.parentModifierNode = parentWrapperId
        })

        const parentNodeInfo = this.scene.nodeMaps.get(this.parent.id)
        const nodeInfo = this.scene.nodeMaps.get(this.id)

        if (parentNodeInfo && nodeInfo) {
          for (const [wrapperId, treeNode] of parentNodeInfo.treeNodes) {
            if (wrapperId !== this.parent.modifierNodeId && this.parent !== treeNode) {
              this.scene.createNode(
                this.id,
                this.treeId,
                undefined, // nodeInfo,
                this.modifierNode,
                this.parentModifierNode,
                treeNode,
              )
            }
          }
        }
      }
    }
  }

  private getComponentProps() {
    const stack: SceneObjectInterface[] = [];
    let nodeObject: SceneObjectInterface | undefined = this._nodeObject;

    // Generate array of object derivations so that we can work
    // backwards from the base object to the most recent derivation.
    while (nodeObject) {
      stack.push(nodeObject)

      nodeObject = nodeObject.baseObject;
    }

    const components: Map<number, NodeComponent> = new Map();

    while (stack.length > 0) {
      const object = stack.pop();

      if (object) {
        for (const comp of object.components) {
          switch (comp.type) {
            case ComponentType.ParticleSystem: {
              // const props = new ParticleSystemProps(
              //   undefined,
              //   comp.props as ParticleSystemProps,
              // );
              const props = comp.props as ParticleSystemProps;

              const ps = new ParticleSystem(props)

              components.set(comp.id, {
                type: comp.type,
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
    }

    this.components = components;

    for (const [, component] of this.components) {
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
    const response = await Http.delete(`/api/tree-nodes/${this.actualTreeId}/${this.actualNodeId}`);

    if (response.ok) {
      runInAction(() => {
        this.detachSelf()
      })
    }
  }

  async onChange() {
    if (this.autosave) {
      // await sceneManager.update(this);
    }
  }

  transformChanged() {
    vec3.copy(this.nodeObject.transformProps.translate.get(), this.renderNode.translate)
    this.renderNode.setFromAngles(
      this.nodeObject.transformProps.rotate.get()[0],
      this.nodeObject.transformProps.rotate.get()[1],
      this.nodeObject.transformProps.rotate.get()[2],
    )
    vec3.copy(this.nodeObject.transformProps.scale.get(), this.renderNode.scale)
  }

  changeName(name: string) {
    runInAction(() => {
      this.nodeObject.header.name.set(name, true)
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

    if (this.wrapperRoot) {
      let stack: TreeNode[] = [this];

      while (stack.length > 0) {
        const node = stack[0];
        stack = stack.slice(1)

        for (const child of node.children) {
          if (child.parentModifierNode !== undefined) {
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
