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
import type {
  PrefabDescriptor, PrefabInstanceDescriptor, PrefabInstanceInterface,
  PrefabInstanceNodeDesriptor,
  PrefabInterface, PrefabNodeInterface,
  SceneObjectBaseInterface,
} from "../../State/types";
import Prefab from "./Prefab";
import { PrefabInstanceObject } from "./SceneObject";

class PrefabInstance extends Entity implements PrefabInstanceInterface {
  prefab: PrefabInterface

  root?: PrefabInstanceObject

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
  ): Promise<PrefabInstanceObject> {
    const object = new PrefabInstanceObject(this, prefabNode);

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

          object.sceneNode.addComponent(ps)

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

          object.sceneNode.addComponent(light)

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
    
    object.objects = await Promise.all(prefabNode.nodes.map((node) => this.fromPrefabNode(prefab, node, descriptor)));

    for (const child of object.objects) {
      child.parent = object;
      object.sceneNode.addNode(child.sceneNode)
    }

    // Setup the transform and copy it to the scene node.
    object.transformProps = new TransformProps(nodeDescriptor?.transformProps, object.transformChanged, prefabNode.transformProps as TransformProps);;

    vec3.copy(object.transformProps.translate.get(), object.sceneNode.translate)
    vec3.copy(object.transformProps.scale.get(), object.sceneNode.scale)

    object.ancestor = prefabNode;

    return object;
  }

  static async fromDescriptor(descriptor: PrefabInstanceDescriptor): Promise<PrefabInstance | undefined> {
    const response = await Http.get<PrefabDescriptor>(`/api/prefabs/${descriptor.object.prefabId}`)

    if (response.ok) {
      const body = await response.body();

      const prefab = await Prefab.fromDescriptor(body);

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
        nodes: nodes.length > 0 ? nodes : undefined,
      }
    })
  }

  getOverridingNodes() {
    const overridingNodes: PrefabInstanceNodeDesriptor[] = [];

    if (this.root) {
      let stack: SceneObjectBaseInterface[] = [this.root];

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
          overridingNodes.push({
            id: instanceObject.id,
            transformProps,
            components,
          })
        }

        // Add the nodes children to the stack
        stack = stack.concat(instanceObject.objects.map((o) => o));
      }
    }

    return overridingNodes;
  }

  async save(): Promise<void> {
    if (this.id < 0) {
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

      if (response.ok) {
  
      }  
    }      
  }

  onChange = () => {
    this.save()    
  }

  async delete(): Promise<void> {
    const response = await Http.delete(`/api/scene-objects/${this.id}`);

    if (response.ok) {
      if (this.root) {
        let stack: SceneObjectBaseInterface[] = [this.root];
  
        while (stack.length > 0) {
          const instanceObject = stack[0];
          stack = stack.slice(1);
  
          // For the root node, detach it from its connection. This should
          // cause the parent object to save without the connection and
          // remove the scene node from the scene graph.
          // For all other nodes, just manually detach the scene node from the scene
          // graph.
          if (instanceObject === this.root) {
            instanceObject.detachSelf();
          }
          else {
            instanceObject.sceneNode.detachSelf()
          }
  
          stack = stack.concat(instanceObject.objects.map((o) => o));
        }
      }  
    }
  }
}

export default PrefabInstance;
