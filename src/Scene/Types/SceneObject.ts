import { vec3 } from "wgpu-matrix";
import type { SceneObjectDescriptor } from "./Types";
import type { SceneObjectInterface } from "./Types";
import type {
  SceneObjectComponent, LightPropsDescriptor, NewSceneObjectComponent,
} from "../../Renderer/Types";
import {
  ComponentType
} from "../../Renderer/Types";
import Light from "../../Renderer/Drawables/Light";
import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import LightProps from "../../Renderer/Properties/LightProps";
import TransformProps from "../../Renderer/Properties/TransformProps";
import { SceneObjectBase } from "./SceneObjectBase";
import { objectManager } from "./ObjectManager";

class SceneObject extends SceneObjectBase implements SceneObjectInterface {
  constructor(id?: number, name?: string) {
    super(id, name)
  }

  static async fromDescriptor(descriptor?: SceneObjectDescriptor) {
    const object = new SceneObject();
    object.autosave = false;

    if (descriptor) {
      object.id = descriptor.id;
      object.name = descriptor?.name ?? object.name;

      object.transformProps = new TransformProps(descriptor.object, object.transformChanged);

      let components = descriptor.object.components;
      if (!components) {
        components = descriptor.object.items;
      }

      if (components) {
        object.components = (await Promise.all(components.map(async (c) => {
          switch (c.type) {
            case ComponentType.ParticleSystem: {
              let propsDescriptor = c.props as ParticleSystemPropsDescriptor;
              if (!propsDescriptor) {
                propsDescriptor = c.item as ParticleSystemPropsDescriptor;
              }

              const props = new ParticleSystemProps(propsDescriptor);
              props.onChange = object.onChange;
              props.node = object;

              const ps = new ParticleSystem(props)

              object.sceneNode.addComponent(ps)

              return {
                id: c.id ?? object.getNextComponentId(),
                type: c.type,
                props,
                object: ps,
              }
            }

            case ComponentType.Light: {
              let propsDescriptor = c.props as LightPropsDescriptor;
              if (!propsDescriptor) {
                propsDescriptor = c.item as LightPropsDescriptor;
              }

              const props = new LightProps(propsDescriptor);
              props.onChange = object.onChange;
              props.node = object;

              const light = new Light(props);

              object.sceneNode.addComponent(light)

              return {
                id: c.id ?? object.getNextComponentId(),
                type: c.type,
                props,
                object: light,
              }
            }
          }

          return undefined
        })))
        .filter((c) => c !== undefined)
      }

      if (descriptor.object.objects) {
        object.objects = (await Promise.all(descriptor.object.objects.map(async (id) => {
          const child = await objectManager.get(id);

          if (child) {
            child.parent = object
            object.sceneNode.addNode(child.sceneNode)
          }

          return child;
        })))
        .filter((o) => o !== undefined);
      }

      // Fix any scale values that are zero.
      for (let i = 0; i < object.transformProps.scale.get().length; i += 1) {
        if (object.transformProps.scale.get()[i] === 0) {
          object.transformProps.scale.get()[i] = 1;
        }  
      }

      vec3.copy(object.transformProps.translate.get(), object.sceneNode.translate)
      vec3.copy(object.transformProps.scale.get(), object.sceneNode.scale)
    }

    object.autosave = true;

    return object;
  }

  getObjectId(): number {
    return this.id
  }

  toDescriptor(): SceneObjectDescriptor | Omit<SceneObjectDescriptor, 'id'> {
    const descriptor = {
      id: this.id < 0 ? undefined : this.id,
      name: this.name,
      object: {
        components: this.components.map((c) => ({
          id: c.id,
          type: c.type,
          props: c.props.toDescriptor(),
        })),
        objects: this.objects.map((o) => {
          return (o.getObjectId())
        }),
        translate: [...this.transformProps.translate.get()],
        rotate: [...this.transformProps.rotate.get()],
        scale: [...this.transformProps.scale.get()],  
        nextComponentId: this.nextComponentId,
      }
    }

    return descriptor;
  }

  async save(): Promise<void> {
    if (this.id < 0) {
      objectManager.add(this)
    }
    else {
      objectManager.update(this)
    }      
  }

  onChange = () => {
    if (this.autosave) {
      this.save();
    }
  }

  async delete(): Promise<void> {
    return objectManager.delete(this)
  }

  addComponent(component: NewSceneObjectComponent) {
    this.components = [
      ...this.components,
      {
        id: this.getNextComponentId(),
        ...component,
      }
    ];

    component.props.onChange = this.onChange;

    if (component.component) {
      this.sceneNode.addComponent(component.component)
    }

    this.onChange()
  }

  removeComponent(component: SceneObjectComponent) {
    const index = this.components.findIndex((i) => i.id === component.id)

    if (index !== -1) {
      this.components = [
        ...this.components.slice(0, index),
        ...this.components.slice(index + 1),
      ]

      if (component.component) {
        this.sceneNode.removeComponent(component.component)
      }

      this.onChange()
    }
  }
}

export default SceneObject;
