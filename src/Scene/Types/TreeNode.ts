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

  get wrapperId(): number | undefined {
    if (this.parent === undefined) {
      return undefined
    }

    if (this.parent.wrapped !== undefined) {
      return this.parent.wrapped
    }

    return this.parent.wrapperId
  }

  @observable
  accessor wrapped: number | undefined;

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

  get topLevelWrapperId(): number | undefined {
    let wrapperId = undefined

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode | undefined = this;

    for (;;) {
      if (node === undefined) {
        break;
      }

      if (node.wrapped !== undefined) {
        wrapperId = node.wrapped
        break;
      }

      node = node.parent
    }

    return wrapperId
  }

  renderNode = new RenderNode();

  scene: SceneInterface;

  @observable
  accessor parentWrapperId: number | undefined;

  // pathId?: number

  // path?: number[]

  get wrapperRoot(): boolean {
    return this.wrapped !== undefined
  }

  get withinWrapper(): boolean {
    return this.wrapperId !== undefined || this.wrapped !== undefined
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
    if (this.wrapped !== undefined) {
      return this.wrapped;
    }

    return this.id
  }

  getPathId(start: TreeNode, wrapperId: number) {
    let id = 0
    const path: number[] = []

    let node: TreeNode | undefined = start
    while (node !== undefined) {
      if (node.wrapped === wrapperId) {
        break;
      }

      if (node.wrapped !== undefined) {
        id ^= node.wrapped
        path.push(node.wrapped)
      }

      node = node.parent
    }

    return { id, path }
  }

  getTopLevelWrapperId(): number | undefined {
    let wrapperId = undefined

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreeNode | undefined = this;

    for (;;) {
      if (node === undefined) {
        break;
      }

      if (node.wrapped !== undefined) {
        wrapperId = node.wrapped
      }

      node = node.parent
    }

    return wrapperId
  }

  async reparent(newParent: TreeNode) {
    // let parentWrapperid = newParent.topLevelWrapperId;
    let wrapperId = newParent.getTopLevelWrapperId()

    if (wrapperId === newParent.parentWrapperId) {
      wrapperId = undefined
    }

    let path: { id: number, path: number[] } | undefined

    if (wrapperId !== undefined) {
      path = this.getPathId(newParent, wrapperId)
      console.log(`${path.id}, ${JSON.stringify(path.path)}, ${wrapperId}`)
    }

    const payload = {
      parentNodeId: newParent.id,
      parentWrapperId: wrapperId ?? null,
      path: path?.path ?? null,
      pathId: path?.id ?? null,
    }

    const response = await Http.patch<unknown, void>(`/api/tree-nodes/${this.actualNodeId}`, payload)

    if (response.ok) {
      runInAction(() => {
        this.parentWrapperId = wrapperId

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
          this.parentWrapperId = parentWrapperId
        })

        const parentNodeInfo = this.scene.nodeMaps.get(this.parent.id)
        const nodeInfo = this.scene.nodeMaps.get(this.id)

        if (parentNodeInfo && nodeInfo) {
          for (const [wrapperId, treeNode] of parentNodeInfo.treeNodes) {
            if (wrapperId !== this.parent.wrapperId && this.parent !== treeNode) {
              this.scene.createNode(
                this.id,
                this.name,
                undefined, // nodeInfo,
                this.wrapped,
                this.parentWrapperId,
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
          if (child.parentWrapperId !== undefined) {
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
      parentTreeId: this.topLevelWrapperId ?? null,
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
