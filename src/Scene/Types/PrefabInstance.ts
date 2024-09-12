import { vec3 } from "wgpu-matrix";
import Http from "../../Http/src";
import Light from "../../Renderer/Drawables/Light";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import TransformProps from "../../Renderer/Properties/TransformProps";
import type { LightPropsInterface } from "../../Renderer/Types";
import { ComponentType } from "../../Renderer/Types";
import Entity from "../../State/Entity";
import type { ConnectedObject, ObjectOverrides, PrefabInstanceInterface, SceneNodeInterface } from "./Types";
import type { PrefabInstanceNodeDesriptor } from "./Types";
import type { PrefabInstanceDescriptor } from "./Types";
import type { SceneNodeBaseInterface } from "./Types";
import type { PrefabNodeInterface } from "./Types";
import type { PrefabInterface } from "./Types";
import { prefabManager } from "./PrefabManager";
import PrefabNodeInstance from "./PrefabNodeInstance";
import { objectManager } from "./ObjectManager";

class PrefabInstance extends Entity implements PrefabInstanceInterface {
  prefab: PrefabInterface

  root?: PrefabNodeInstance

  autosave = true;

  constructor(prefab: PrefabInterface, id?: number) {
    super(id, `Prefab Instance ${Math.abs(id ?? 0)}`)
    this.prefab = prefab;
  }

  static async fromPrefab(prefab: PrefabInterface, descriptor?: PrefabInstanceDescriptor): Promise<PrefabInstance | undefined> {
    const prefabInstance = new PrefabInstance(prefab)

    prefabInstance.autosave = false;

    prefabInstance.id = descriptor?.id ?? prefabInstance.id;
    prefabInstance.name = prefab.name;

    if (prefab.root) {
      const object = await prefabInstance.fromPrefabNode(prefab, prefab.root, descriptor)

      prefabInstance.root = object;

      prefabInstance.autosave = true;
      
      return prefabInstance;
    }
  }

  private async fromPrefabNode(
    prefab: PrefabInterface,  // refers to the prefab itself
    prefabNode: PrefabNodeInterface, // A node within the prefab itself
    descriptor?: PrefabInstanceDescriptor,
  ): Promise<PrefabNodeInstance> {
    const object = new PrefabNodeInstance(this, prefabNode);

    const nodeDescriptor = descriptor?.object.nodes?.find((n) => n.id === prefabNode.id);

    object.prefabInstance = this;
  
    object.id = prefabNode.id;
    object.name = prefabNode.name;

    object.components = (await Promise.all(prefabNode.components.map(async (c) => {
      // Find a component descriptor that matches the id and type of the prefab component.
      const componentDescriptor = nodeDescriptor?.components.find((component) => (
        component.id === c.id && component.type === c.type
      ));

      switch (c.type) {
        case ComponentType.ParticleSystem: {
          const prefabProps = c.props as ParticleSystemProps;

          const props = new ParticleSystemProps(
            componentDescriptor?.props as ParticleSystemPropsDescriptor,
            prefabProps,
          );

          props.onChange = object.onChange;
          props.node = object;

          const ps = new ParticleSystem(props)

          // object.renderNode.addComponent(ps)

          return {
            id: c.id,
            type: c.type,
            props: props,
            object: ps,
            node: object,
          }
        }

        case ComponentType.Light: {
          const light = new Light(c.props as LightPropsInterface);

          // object.renderNode.addComponent(light)

          return {
            id: c.id,
            type: c.type,
            props: c.props,
            object: light,
            node: object,
          }
        }
      }

      return undefined
    })))
      .filter((c) => c !== undefined)
    
    // object.nodes = await Promise.all(prefabNode.nodes.map((node) => this.fromPrefabNode(prefab, node, descriptor)));

    const connectedObjects = descriptor?.object.connectedObjects
    if (connectedObjects) {
      for (const connectedObject of connectedObjects) {
        if (connectedObject.prefabNodeId === prefabNode.id) {
          const newObject = await objectManager.getSceneNode(connectedObject.objectId)

          if (newObject) {
            // object.nodes.push(newObject)
            // newObject.parent = object;
          }
        }
      }  
    }

    // for (const child of object.nodes) {
    //   child.parent = object;
    //   object.renderNode.addNode(child.renderNode)
    // }

    // Setup the transform and copy it to the scene node.
    object.transformProps = new TransformProps(nodeDescriptor?.transformProps, object.transformChanged, prefabNode.transformProps as TransformProps);;

    // vec3.copy(object.transformProps.translate.get(), object.renderNode.translate)
    // vec3.copy(object.transformProps.scale.get(), object.renderNode.scale)

    object.baseNode = prefabNode;

    return object;
  }

  getMaxNodeId() {
    let max = 0;

    if (this.root) {
      let stack: SceneNodeBaseInterface[] = [this.root];

      while (stack.length > 0) {
        const instanceObject = stack[0];
        stack = stack.slice(1);

        if (instanceObject.id > max) {
          max = instanceObject.id
        }

        // for (const object of instanceObject.nodes) {
        //   // If this is an instance object and the prefab instance is the one we are processing then
        //   // add the object to the stack.
        //   if (isPrefabInstanceObject(object) && object.prefabInstance === this) {
        //     stack.push(object)
        //   }
        // }
      }  
    }

    return max;
  }

  async attachSceneNode(
    sceneNode: SceneNodeInterface,
  ): Promise<void> {
    // const id = this.getMaxNodeId() + 1;
    // const parent = (sceneNode.parent as PrefabNodeInstance);
    // const prefabParent = (sceneNode.parent as PrefabNodeInstance).baseNode;

    // const prefabRoot = this.prefab.addSceneNodes(sceneNode, id, prefabParent);

    // let root: PrefabNodeInstance | null = null;

    // // Starting at the root of the new prefab tree branch, add a prefab instance object
    // let stack: { prefabNode: PrefabNodeInterface, parent: PrefabNodeInstance | null }[] = [{ prefabNode: prefabRoot, parent}];

    // while (stack.length > 0) {
    //   const { prefabNode, parent } = stack[0];
    //   stack = stack.slice(1);

    //   const node = new PrefabNodeInstance(this, prefabNode);

    //   node.prefabInstance = this;
    
    //   node.id = prefabNode.id;
    //   node.name = prefabNode.name;

    //   node.components = prefabNode.components.map((c) => {
    //     // Find a component descriptor that matches the id and type of the prefab component.
    //     // const componentDescriptor = nodeDescriptor?.components.find((component) => (
    //     //   component.id === c.id && component.type === c.type
    //     // ));

    //     switch (c.type) {
    //       case ComponentType.ParticleSystem: {
    //         const prefabProps = c.props as ParticleSystemProps;

    //         const props = new ParticleSystemProps(
    //           undefined,
    //           prefabProps,
    //         );

    //         props.onChange = node.onChange;
    //         props.node = node;

    //         const ps = new ParticleSystem(props)

    //         node.renderNode.addComponent(ps)

    //         return {
    //           id: c.id,
    //           type: c.type,
    //           props: props,
    //           object: ps,
    //           node,
    //         }
    //       }

    //       case ComponentType.Light: {
    //         const light = new Light(c.props as LightPropsInterface);

    //         node.renderNode.addComponent(light)

    //         return {
    //           id: c.id,
    //           type: c.type,
    //           props: c.props,
    //           object: light,
    //           node,
    //         }
    //       }
    //     }

    //     return undefined
    //   })
    //     .filter((c) => c !== undefined)
      
    //   if (parent) {
    //     node.parent = parent
    //     parent.renderNode.addNode(node.renderNode)
    //   }

    //   // Setup the transform and copy it to the scene node.
    //   node.transformProps = new TransformProps(undefined, node.transformChanged, prefabNode.transformProps as TransformProps);

    //   vec3.copy(node.transformProps.translate.get(), node.renderNode.translate)
    //   vec3.copy(node.transformProps.scale.get(), node.renderNode.scale)

    //   node.baseNode = prefabNode;

    //   // Push prefab children on to the stack
    //   for (const child of prefabNode.nodes) {
    //     stack.push({ prefabNode: child, parent: node })
    //   }

    //   if (!root) {
    //     root = node;
    //   }
    // }

    // this.autosave = false;

    // sceneNode.detachSelf()

    // this.autosave = true;

    // if (!root) {
    //   throw new Error('root is undefeind');      
    // }
    
    // parent.addObject(root);

    // this.save()
  }

  static async fromDescriptor(descriptor: PrefabInstanceDescriptor): Promise<PrefabInstance | undefined> {
    const prefab = await prefabManager.get(descriptor.object.prefabId)

    if (prefab) {
      return PrefabInstance.fromPrefab(prefab, descriptor);
    }
  }

  toDescriptor(): PrefabInstanceDescriptor {
    const nodes = this.getOverridingNodes();

    return ({
      id: this.id,
      name: this.name,
      object: {
        prefabId: this.prefab.id,
        nodes: nodes.nodeOverrides.length > 0 ? nodes.nodeOverrides : undefined,
        connectedObjects: nodes.connectedObjects,
      }
    })
  }

  getOverridingNodes(): {
    nodeOverrides: PrefabInstanceNodeDesriptor[],
    connectedObjects: ConnectedObject[],
  } {
    const nodeOverrides: PrefabInstanceNodeDesriptor[] = [];
    const connectedObjects: ConnectedObject[] = [];

    if (this.root) {
      let stack: SceneNodeBaseInterface[] = [this.root];

      while (stack.length > 0) {
        const instanceObject = stack[0];
        stack = stack.slice(1);

        const components = instanceObject.components.map((component) => {
          const props = component.props.toDescriptor(true);

          if (props !== undefined) {
            return {
              id: component.id,
              type: component.type,
              props,
            }  
          }

          return undefined
        })
          .filter((c) => c !== undefined)

        const transformProps = instanceObject.transformProps.toDescriptor(true);

        if (components.length > 0 || transformProps) {
          nodeOverrides.push({
            id: instanceObject.id,
            transformProps,
            components,
          })
        }

        // Add the node's children to the stack
        // for (const object of instanceObject.nodes) {
        //   // If this is an instance object and the prefab instance is the one we are processing then
        //   // add the object to the stack. Otherwise, add the object to the connected object array.
        //   if (isPrefabInstanceObject(object) && object.prefabInstance === this) {
        //     stack.push(object)
        //   }
        //   else {
        //     connectedObjects.push({ prefabNodeId: instanceObject.id, objectId: object.id });
        //   }
        // }
      }
    }

    return { nodeOverrides, connectedObjects };
  }

  getOverrides(): ObjectOverrides[] {
    const overrides: ObjectOverrides[] = []

    if (this.root) {
      let stack: PrefabNodeInstance[] = [this.root]

      while (stack.length > 0) {
        const instanceObject = stack[0];
        stack = stack.slice(1);

        const objectOverrides: ObjectOverrides = {
          object: instanceObject,
          overrides: []
        }

        const t1 = instanceObject.components
          .flatMap((component) => component.props.getOverrides());

        const t2 = t1
          .filter((c) => c !== undefined)
          .map((p) => ({ property: p }))

        objectOverrides.overrides = objectOverrides.overrides.concat(t2)

        // Add the node's children to the stack
        // for (const object of instanceObject.nodes) {
        //   // If this is an instance object and the prefab instance is the one we are processing then
        //   // add the object to the stack. Otherwise, add the object to the connected object array.
        //   if (isPrefabInstanceObject(object) && object.prefabInstance === this) {
        //     stack.push(object)
        //   }
        //   else {
        //     objectOverrides.overrides.push({ connectedObject: object })
        //   }
        // }
        
        if (objectOverrides.overrides.length > 0) {
          overrides.push(objectOverrides)
        }
      }
    }

    return overrides;
  }

  async save(): Promise<void> {
    if (this.id < 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...descriptor } = this.toDescriptor();

      const response = await Http.post<Omit<PrefabInstanceDescriptor, 'id'>, PrefabInstanceDescriptor>(`/api/scene-objects`, descriptor);

      if (response.ok) {
        const body = await response.body();

        if (body.id !== undefined) {
          this.id = body.id;
        }
      }  
    }
    else {
      const descriptor = this.toDescriptor();

      const response = await Http.patch<PrefabInstanceDescriptor, void>(`/api/scene-objects/${this.id}`, descriptor);

      if (response.ok) { /* empty */ }  
    }      
  }

  onChange = () => {
    this.save()    
  }
}

export default PrefabInstance;
