import { computed, observable, runInAction } from "mobx";
import RenderNode from "../../Renderer/Drawables/SceneNodes/RenderNode";
import Entity, { getNextObjectId } from "../../State/Entity";
import { type SceneObjectInterface, type SceneInterface, type SceneItemType, type NodesResponse } from "./Types";
import type ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import type LightProps from "../../Renderer/Properties/LightProps";
import { ComponentType, type LightInterface, type ParticleSystemInterface } from "../../Renderer/Types";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import { vec3 } from "wgpu-matrix";
import Http from "../../Http/src";
import SceneObject from "./SceneObject";

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

  @observable
  accessor treeId: number | undefined;

  private _nodeObject: SceneObjectInterface;

  get nodeObject(): SceneObjectInterface {
    return this._nodeObject
  }

  set nodeObject(object: SceneObjectInterface) {
    this._nodeObject = object
    this.getComponentProps()
    this.transformChanged()
  }

  renderNode = new RenderNode();

  scene: SceneInterface;

  @observable
  accessor newItemType: SceneItemType | undefined = undefined;

  autosave = true;

  constructor(scene: SceneInterface) {
    super(getNextObjectId(), '')

    this._nodeObject = new SceneObject(this.id)
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
    const response = await Http.delete(`/api/tree-nodes/${this.treeId ?? this.id}`);

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
        const response = await Http.patch<unknown, NodesResponse>(`/api/tree-nodes/${this.id}`, {
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

    if (this.treeId !== undefined) {
      let stack: TreeNode[] = [this];

      while (stack.length > 0) {
        const node = stack[0];
        stack = stack.slice(1)
  
        for (const child of node.nodes) {
          if (child.treeId === this.treeId) {
            stack.push(child)
          }
          else {
            connections.push(child)
          }
        }
      }  
    }

    return connections;
  }
}

export default TreeNode;
