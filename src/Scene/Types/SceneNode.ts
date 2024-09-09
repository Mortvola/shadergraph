import { vec3 } from "wgpu-matrix";
import type { SceneNodeDescriptor } from "./Types";
import type { SceneNodeInterface } from "./Types";
import type {
  SceneNodeComponent, LightPropsDescriptor, NewSceneNodeComponent,
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
import { SceneNodeBase } from "./SceneNodeBase";
import { objectManager } from "./ObjectManager";

class SceneNode extends SceneNodeBase implements SceneNodeInterface {
  constructor(id?: number, name?: string) {
    super(id, name)
  }

  static async fromDescriptor(descriptor?: SceneNodeDescriptor) {
    const object = new SceneNode();
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

              const ps = new ParticleSystem(props)

              object.renderNode.addComponent(ps)

              return {
                id: c.id ?? object.getNextComponentId(),
                type: c.type,
                props,
                object: ps,
              }
            }

            case ComponentType.Light: {
              const propsDescriptor = c.props as LightPropsDescriptor;

              const props = new LightProps(propsDescriptor);
              props.onChange = object.onChange;
              props.node = object;

              const light = new Light(props);

              object.renderNode.addComponent(light)

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

      if (descriptor.object.nodes) {
        object.nodes = (await Promise.all(descriptor.object.nodes.map(async (id) => {
          const child = await objectManager.get(id);

          if (child) {
            child.parent = object
            object.renderNode.addNode(child.renderNode)
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

      vec3.copy(object.transformProps.translate.get(), object.renderNode.translate)
      vec3.copy(object.transformProps.scale.get(), object.renderNode.scale)
    }

    object.autosave = true;

    return object;
  }

  getObjectId(): number {
    return this.id
  }

  toDescriptor(): SceneNodeDescriptor | Omit<SceneNodeDescriptor, 'id'> {
    const descriptor = {
      id: this.id < 0 ? undefined : this.id,
      name: this.name,
      object: {
        components: this.components.map((c) => ({
          id: c.id,
          type: c.type,
          props: c.props.toDescriptor(),
        })),
        nodes: this.nodes.map((o) => {
          return (o.getObjectId())
        }),
        transformProps: this.transformProps.toDescriptor()!,
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

  addComponent(component: NewSceneNodeComponent) {
    this.components = [
      ...this.components,
      {
        id: this.getNextComponentId(),
        ...component,
      }
    ];

    component.props.onChange = this.onChange;

    if (component.component) {
      this.renderNode.addComponent(component.component)
    }

    this.onChange()
  }

  removeComponent(component: SceneNodeComponent) {
    const index = this.components.findIndex((i) => i.id === component.id)

    if (index !== -1) {
      this.components = [
        ...this.components.slice(0, index),
        ...this.components.slice(index + 1),
      ]

      if (component.component) {
        this.renderNode.removeComponent(component.component)
      }

      this.onChange()
    }
  }
}

export default SceneNode;
