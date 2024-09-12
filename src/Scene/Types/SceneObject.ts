import { ObjectType, type SceneObjectDescriptor, type SceneObjectInterface } from "./Types";
import {
  type SceneObjectComponent, type LightPropsDescriptor, type NewSceneObjectComponent,
  ComponentType,
} from "../../Renderer/Types";
import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import LightProps from "../../Renderer/Properties/LightProps";
import TransformProps from "../../Renderer/Properties/TransformProps";
import { SceneObjectBase as SceneObjectBase } from "./SceneObjectBase";
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

      object.transformProps = new TransformProps(descriptor.object.transformProps, object.transformChanged);

      const components = descriptor.object.components;

      if (components) {
        object.components = (await Promise.all(components.map(async (c) => {
          switch (c.type) {
            case ComponentType.ParticleSystem: {
              const propsDescriptor = c.props as ParticleSystemPropsDescriptor;

              const props = new ParticleSystemProps(propsDescriptor);
              props.onChange = object.onChange;
              props.node = object;

              return {
                id: c.id ?? object.getNextComponentId(),
                type: c.type,
                props,
              }
            }

            case ComponentType.Light: {
              const propsDescriptor = c.props as LightPropsDescriptor;

              const props = new LightProps(propsDescriptor);
              props.onChange = object.onChange;
              props.node = object;

              return {
                id: c.id ?? object.getNextComponentId(),
                type: c.type,
                props,
              }
            }
          }

          return undefined
        })))
        .filter((c) => c !== undefined)
      }

      // Fix any scale values that are zero.
      for (let i = 0; i < object.transformProps.scale.get().length; i += 1) {
        if (object.transformProps.scale.get()[i] === 0) {
          object.transformProps.scale.get()[i] = 1;
        }  
      }

      // vec3.copy(object.transformProps.translate.get(), object.renderNode.translate)
      // vec3.copy(object.transformProps.scale.get(), object.renderNode.scale)
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
        type: ObjectType.NodeObject,
        components: this.components.map((c) => ({
          id: c.id,
          type: c.type,
          props: c.props.toDescriptor(),
        })),
        transformProps: this.transformProps.toDescriptor()!,
        nextComponentId: this.nextComponentId,
      }
    }

    return descriptor;
  }

  async save(): Promise<void> {
    if (this.id < 0) {
      await objectManager.add(this)
    }
    else {
      await objectManager.update(this)
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

    // if (component.component) {
      // this.renderNode.addComponent(component.component)
    // }

    this.onChange()
  }

  removeComponent(component: SceneObjectComponent) {
    const index = this.components.findIndex((i) => i.id === component.id)

    if (index !== -1) {
      this.components = [
        ...this.components.slice(0, index),
        ...this.components.slice(index + 1),
      ]

      // if (component.component) {
        // this.renderNode.removeComponent(component.component)
      // }

      this.onChange()
    }
  }
}

export default SceneObject;
