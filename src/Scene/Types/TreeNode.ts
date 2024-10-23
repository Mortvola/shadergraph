import { computed, observable, runInAction } from 'mobx';
import RenderNode from '../../Renderer/Drawables/SceneNodes/RenderNode';
import Entity, { getNextObjectId } from '../../State/Entity';
import { type SceneObjectInterface, type SceneInterface, type SceneItemType } from './Types';
import type ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';
import type LightProps from '../../Renderer/Properties/LightProps';
import { ComponentType, type LightInterface, type ParticleSystemInterface } from '../../Renderer/Types';
import ParticleSystem from '../../Renderer/ParticleSystem/ParticleSystem';
import { vec3 } from 'wgpu-matrix';
import Http from '../../Http/src';
import SceneObject from './SceneObject';
import type ModifierNode from './ModifierNode';

type NodeComponent = {
  type: ComponentType,
  props: ParticleSystemProps | LightProps,
  component: ParticleSystemInterface | LightInterface,
}

class TreeNode extends Entity {
  @observable
  accessor nodes: TreeNode[] = [];

  components: Map<number, NodeComponent> = new Map();

  parent?: TreeNode;

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

  get topLevelModifierNodeId(): number | undefined {
    let modifierNode = undefined

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode | undefined = this;

    for (;;) {
      if (node === undefined) {
        break;
      }

      if (node.modifierNode !== undefined) {
        modifierNode = node.modifierNode
        break;
      }

      node = node.parent
    }

    return modifierNode?.id
  }

  renderNode = new RenderNode();

  scene: SceneInterface;

  @observable
  accessor parentModifierNode: ModifierNode | undefined;

  // pathId?: number

  // path?: number[]

  get wrapperRoot(): boolean {
    return this.modifierNode !== undefined
  }

  get withinWrapper(): boolean {
    return this.modifierNodeId !== undefined || this.modifierNode !== undefined
  }

  @observable
  accessor newItemType: SceneItemType | undefined = undefined;

  autosave = true;

  constructor(scene: SceneInterface, name: string) {
    super(getNextObjectId(), name)

    this._nodeObject = new SceneObject(this.id, undefined, this)
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

  async addNode(node: TreeNode): Promise<void> {
    return runInAction(async () => {
      this.nodes = [
        ...this.nodes,
        node,
      ];

      node.parent = this;
      this.renderNode.addNode(node.renderNode)

      // this.onChange();
    })
  }

  removeNode(node: TreeNode) {
    const index = this.nodes.findIndex((o) => o === node)

    if (index !== -1) {
      runInAction(() => {
        this.nodes = [
          ...this.nodes.slice(0, index),
          ...this.nodes.slice(index + 1),
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

  getPathId(start: TreeNode, modifierNode: ModifierNode) {
    let id = 0
    const path: number[] = []

    let node: TreeNode | undefined = start
    while (node !== undefined) {
      if (node.modifierNode?.id === modifierNode.id) {
        break;
      }

      if (node.modifierNode !== undefined) {
        id ^= node.modifierNode.id
        path.push(node.modifierNode.id)
      }

      node = node.parent
    }

    return { id, path }
  }

  getTopLevelModifierNode(): ModifierNode | undefined {
    let modifierNode = undefined

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode | undefined = this;

    for (;;) {
      if (node === undefined) {
        break;
      }

      if (node.modifierNode !== undefined) {
        modifierNode = node.modifierNode
      }

      node = node.parent
    }

    return modifierNode
  }

  async reparent(newParent: TreeNode) {
    // let parentWrapperid = newParent.topLevelWrapperId;
    let modifierNode = newParent.getTopLevelModifierNode()

    // If we are connecting the node to another node that is an added node
    // from the same modifier node then we don't consider this an added node.
    if (modifierNode === newParent.parentModifierNode) {
      modifierNode = undefined
    }

    let path: { id: number, path: number[] } | undefined

    if (modifierNode !== undefined) {
      path = this.getPathId(newParent, modifierNode)
      console.log(`${path.id}, ${JSON.stringify(path.path)}, ${modifierNode.id}`)
    }

    const payload = {
      parentNodeId: newParent.id,
      parentWrapperId: modifierNode?.id ?? null,
      path: path?.path ?? null,
      pathId: path?.id ?? null,
    }

    const response = await Http.patch<unknown, void>(`/api/tree-nodes/${this.actualNodeId}`, payload)

    if (response.ok) {
      runInAction(() => {
        if (this.parentModifierNode !== undefined) {
          if (this.parentModifierNode?.id !== modifierNode?.id) {
            // Changing parent modifier nodes. Remove from the old and
            // add to the new (if there is a new one).
            const index = this.parentModifierNode.addedNodes.findIndex((entry) => entry.nodeId === this.id)

            if (index !== -1) {
              this.parentModifierNode.addedNodes = [
                ...this.parentModifierNode.addedNodes.slice(0, index),
                ...this.parentModifierNode.addedNodes.slice(index + 1),
              ]
            }

            // If there is a new modifier node then add
            // this node to its list of added nodes.
            if (modifierNode !== undefined) {
              if (path === undefined) {
                throw new Error('path not defined')
              }

              modifierNode.addedNodes.push({
                nodeId: this.id,
                parentNodeId: newParent.id,
                pathId: path.id,
              })
            }
          } else {
            // The node is staying within the addedNodes of the
            // same modifier node.

            if (path === undefined) {
              throw new Error('path not defined')
            }

            // Find the existing node in the addedNodes and update it
            const entry = modifierNode.addedNodes.find((entry) => entry.nodeId === this.id)

            if (entry) {
              entry.parentNodeId = newParent.id
              entry.pathId = path.id
            } else {
              // For some reason, the node was not found.
              // Add it.
              console.log(`Node not found in addedNodes: ${modifierNode.id}, ${this.id}`)

              modifierNode.addedNodes.push({
                nodeId: this.id,
                parentNodeId: newParent.id,
                pathId: path.id,
              })
            }
          }
        } else if (modifierNode !== undefined) {
          // node was not an added ndoe in a modifier node but
          // is being added to a modifier node.
          if (path === undefined) {
            throw new Error('path not defined')
          }

          modifierNode.addedNodes.push({
            nodeId: this.id,
            parentNodeId: newParent.id,
            pathId: path.id,
          })
        }

        this.parentModifierNode = modifierNode

        this.detachSelf();
        newParent.addNode(this);
      })
    }
  }

  async applyConnectionOverride(parentWrapperId?: number): Promise<void> {
    if (this.parent) {
      const response = await Http.patch<unknown, void>(`/api/tree-nodes/${this.actualNodeId}`, {
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
                this.name,
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
    const response = await Http.delete(`/api/tree-nodes/${this.actualNodeId}`);

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
    (
      async () => {
        const response = await Http.patch<unknown, void>(`/api/tree-nodes/${this.actualNodeId}`, {
          name,
        })

        if (response.ok) {
          runInAction(() => {
            this.name = name
          })
        }
      }
    )()
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

        for (const child of node.nodes) {
          if (child.parentModifierNode !== undefined) {
            connections.push(child)
          }

          stack.push(child)
        }
      }
    }

    return connections;
  }

  async instantiatePrefab(rootNodeId: number) {
    const payload = {
      parentNodeId: this.id,
      parentTreeId: this.topLevelModifierNodeId ?? null,
      rootNodeId: rootNodeId,
    }

    const response = await Http.post<unknown, void>('/api/tree-nodes', payload)

    if (response.ok) {
      // const body = await response.body()

      // const tree = await this.scene.treeFromDescriptor(body);

      // if (tree) {
      //   this.addNode(tree);
      // }
    }
  }
}

export default TreeNode;
