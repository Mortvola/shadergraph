import Http from "../../Http/src";
import Light from "../../Renderer/Drawables/Light";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import { ParticleSystemPropsInterface } from "../../Renderer/ParticleSystem/Types";
import { ComponentType, LightPropsInterface } from "../../Renderer/types";
import Entity from "../../State/Entity";
import {
  PrefabDescriptor, PrefabInstanceDescriptor, PrefabInstanceInterface,
  PrefabInterface, PrefabNodeInterface,
  SceneObjectInterface,
} from "../../State/types";
import Prefab from "./Prefab";
import { PrefabInstanceObject } from "./SceneObject";

class PrefabInstance extends Entity implements PrefabInstanceInterface {
  prefab: PrefabInterface

  root?: PrefabInstanceObject

  constructor(prefab: PrefabInterface, id?: number) {
    super(id, `Prefab Instance ${Math.abs(id ?? 0)}`)
    this.prefab = prefab;
  }

  static fromPrefab(prefab: PrefabInterface): PrefabInstance | undefined {
    const prefabInstance = new PrefabInstance(prefab)

    prefabInstance.name = prefab.name;

    if (prefab.root) {
      const object = PrefabInstance.fromPrefabNode(prefab, prefabInstance, prefab.root)

      prefabInstance.root = object;

      return prefabInstance;
    }
  }

  private static fromPrefabNode(
    prefab: PrefabInterface,  // refers to the prefab itself
    prefabInstance: PrefabInstance, // refers to the instance of the prefab
    prefabNode: PrefabNodeInterface, // A node within the prefab itself
  ): PrefabInstanceObject {
    const object = new PrefabInstanceObject(prefabInstance);

    object.prefabInstance = prefabInstance;
  
    if (prefabNode) {
      object.name = prefabNode.name;

      object.components = prefabNode.components.map((c) => {
        switch (c.type) {
          case ComponentType.ParticleSystem:
            const ps = new ParticleSystem(c.props as ParticleSystemPropsInterface)

            object.sceneNode.addComponent(ps)

            return {
              type: c.type,
              props: c.props,
              object: ps,
            }

          case ComponentType.Light: {
            const light = new Light(c.props as LightPropsInterface);

            object.sceneNode.addComponent(light)

            return {
              type: c.type,
              props: c.props,
              object: light,
            }
          }
        }

        return undefined
      })
      .filter((c) => c !== undefined)
      
      object.objects = prefabNode.nodes.map((node) => PrefabInstance.fromPrefabNode(prefab, prefabInstance, node));

      for (const child of object.objects) {
        child.parent = object;
        object.sceneNode.addNode(child.sceneNode)
      }

      // The node id of the root node of a prefab is always zero.
      // The root node always has its own copy of the transform props.
      // All other nodes shall reference the corresponding node's prefab transforms.
      if (prefabNode.id !== 0) {
        object.transformProps = prefabNode.transformProps;
      }

      object.sceneNode.translate = object.transformProps.translate;

      object.prefabNode = prefabNode;
    }

    return object;
  }

  static async fromDescriptor(descriptor: PrefabInstanceDescriptor): Promise<PrefabInstance | undefined> {
    const response = await Http.get<PrefabDescriptor>(`/prefabs/${descriptor.object.prefabId}`)

    if (response.ok) {
      const body = await response.body();

      const prefab = await Prefab.fromDescriptor(body);

      const prefabInstance = PrefabInstance.fromPrefab(prefab);

      return prefabInstance;
    }
  }

  toDescriptor(): PrefabInstanceDescriptor {
    return ({
      id: this.id,
      name: this.name,
      object: {
        prefabId: this.prefab.id,
      }
    })
  }

  async save(): Promise<void> {
    if (this.id < 0) {
      const { id, ...descriptor } = this.toDescriptor();

      const response = await Http.post<Omit<PrefabInstanceDescriptor, 'id'>, PrefabInstanceDescriptor>(`/scene-objects`, descriptor);

      if (response.ok) {
        const body = await response.body();

        if (body.id !== undefined) {
          this.id = body.id;
        }
      }  
    }
    else {
      const response = await Http.patch<PrefabInstanceDescriptor, void>(`/scene-objects/${this.id}`, this.toDescriptor());

      if (response.ok) {
  
      }  
    }      
  }

  onChange = () => {
    this.save()    
  }

  async delete(): Promise<void> {
    const response = await Http.delete(`/scene-objects/${this.id}`);

    if (response.ok) {
      if (this.root) {
        let stack: SceneObjectInterface[] = [this.root];
  
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
