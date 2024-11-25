import { observable } from 'mobx';
import {
  type ComponentPropsDescriptor,
  ComponentType, type LightPropsDescriptor,
  type SceneObjectComponent,
} from '../../Renderer/Types';
import {
  type SceneObjectInterface, type SceneObjectDescriptor,
  type TransformPropsDescriptor,
  type SceneObjectModifications,
  type SceneObjectComponents,
} from './Types';
import TransformProps from '../../Renderer/Properties/TransformProps';
import type TreeNode from './TreeNode';
import ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';
import { type ParticleSystemPropsDescriptor } from '../../Renderer/ParticleSystem/Types';
import LightProps from '../../Renderer/Properties/LightProps';
import { PSString } from '../../Renderer/Properties/Property';
import Http from '../../Http/src';

export type ComponentMap = Map<string, ComponentPropsDescriptor>

class SceneObject implements SceneObjectInterface {
  id: number

  name = new PSString()

  @observable
  accessor components: SceneObjectComponents = {}

  node?: TreeNode;

  get isTopLevel(): boolean {
    return this.node?.sceneId === this.node?.scene.root?.sceneId
  }

  autosave = true;

  get hasOverrides(): boolean {
    for (const t in this.components) {
      if (this.components[t].hasOverrides) {
        return true;
      }
    }

    return false;
  }

  constructor(id: number) {
    this.id = id
  }

  static fromDescriptor(
    descriptor: SceneObjectDescriptor,
    components: ComponentMap,
  ) {
    const object = new SceneObject(descriptor.id);
    object.autosave = false;

    object.name = new PSString(
      descriptor.name,
      object.onChange,
    )

    for (const componentType of descriptor.components) {
      const componentDescriptor = components.get(componentType)

      if (componentDescriptor) {
        object.createComponent(componentType as ComponentType, componentDescriptor)
      }
    }

    object.autosave = true;

    return object;
  }

  private createComponent(componentType: ComponentType, descriptor: ComponentPropsDescriptor) {
    switch (componentType) {
      case ComponentType.Transform: {
        const props = new TransformProps(
          descriptor as TransformPropsDescriptor,
        );

        // Fix any scale values that are zero.
        for (let i = 0; i < props.scale.get().length; i += 1) {
          if (props.scale.get()[i] === 0) {
            props.scale.get()[i] = 1;
          }
        }

        props.onChange = () => {
          console.log('transform changed')
          this.transformChanged()

          this.saveComponent(componentType, props)
        }

        this.components[componentType] = props

        break
      }

      case ComponentType.ParticleSystem: {
        const propsDescriptor = descriptor as ParticleSystemPropsDescriptor;

        const props = new ParticleSystemProps(propsDescriptor);

        props.onChange = () => { this.saveComponent(componentType, props) };

        this.components[componentType] = props

        break;
      }

      case ComponentType.Light: {
        const propsDescriptor = descriptor as LightPropsDescriptor;

        const props = new LightProps(propsDescriptor);
        props.onChange = this.onChange;

        this.components[componentType] = props

        break;
      }
    }
  }

  applyModifications(modifications: SceneObjectModifications, override = false) {
    for (const key in modifications) {
      if (key === 'name') {
        if (modifications.name !== undefined) {
          this.name.set((modifications.name as unknown) as string, override)
        }
      } else {
        const componentDescriptor = modifications[key] as ComponentPropsDescriptor

        this.updateComponent(key as ComponentType, componentDescriptor, override)
      }
    }
  }

  updateComponent(
    componentType: ComponentType,
    componentDescriptor: ComponentPropsDescriptor,
    override: boolean,
  ) {
    const component = this.components[componentType]

    if (component) {
      switch (componentType) {
        case ComponentType.Transform: {
          (component as TransformProps).applyModifications(
            componentDescriptor as TransformPropsDescriptor,
            override,
          )
          break;
        }

        case ComponentType.ParticleSystem: {
          (component as ParticleSystemProps).applyModifications(
            componentDescriptor as ParticleSystemPropsDescriptor,
            override,
          )
          break;
        }
      }
    }
  }

  onChange = () => {
    if (this.autosave) {
      const descriptor = this.toDescriptor(false)

      if (descriptor) {
        this.node?.scene.updateObjectComponent(this.id, ComponentType.Self, descriptor)
      }
    }
  }

  async saveComponent(componentType: ComponentType, component: SceneObjectComponent) {
    // Is this a component being updated or is a modification to a component being updated?
    if (this.isTopLevel) {
      // A component is being updated.
      const descriptor = component.toDescriptor(false);

      if (descriptor) {
        await this.node?.scene.updateObjectComponent(this.id, componentType, descriptor)
      }
    } else {
      // A modification to a component is being updated.

      if (this.node === undefined) {
        throw new Error('node is not defined')
      }

      const descriptor = component.toDescriptor(true)

      if (descriptor) {
        const modifierNode = this.node?.getTopLevelModifierNode()?.modifierNode

        if (modifierNode) {
          const pathId = this.node.getPathId(modifierNode)

          let modifications = modifierNode.modifications.get(pathId)

          if (modifications === undefined) {
            modifications = { pathId, sceneObject: {}, addedNodes: [] }
            modifierNode.modifications.set(pathId, modifications)
          }

          const updatedModifications = {
            ...modifications.sceneObject,
            name: this.name.toDescriptor(true),
            [componentType]: descriptor,
          }

          const payload = {
            modifierNodeId: modifierNode.id,
            sceneId: modifierNode.sceneId,
            pathId,
            modifications: updatedModifications,
          }

          const response = await Http.put('/api/node-modifications', payload)

          if (response.ok) {
            modifications.sceneObject = updatedModifications as SceneObjectModifications
          }
        }
      }
    }
  }

  addComponent(componentType: ComponentType, component: SceneObjectComponent) {
    this.components[componentType] = component
    component.onChange = this.onChange;

    // if (component.component) {
      // this.renderNode.addComponent(component.component)
    // }

    this.onChange()
  }

  removeComponent(componentType: ComponentType) {
    const c = this.components[componentType]

    if (c !== undefined) {
      // this.renderNode.removeComponent(c.component)
      delete this.components[componentType]
      this.onChange()
    }

    // const index = this.components.findIndex((i) => i.id === component.id)

    // if (index !== -1) {
    //   this.components = [
    //     ...this.components.slice(0, index),
    //     ...this.components.slice(index + 1),
    //   ]

    //   // if (component.component) {
    //     // this.renderNode.removeComponent(component.component)
    //   // }

      // this.onChange()
    // }
  }

  transformChanged = () => {
    this.node?.transformChanged()

    this.onChange();
  }

  isPrefabInstanceRoot(): boolean {
    return this.node?.modifierNode !== undefined
  }

  toDescriptor(overridesOnly: boolean): SceneObjectDescriptor {
    const descriptor = {
      id: this.id,
      name: this.name.toDescriptor(overridesOnly),
      components: Object.keys(this.components),
    }

    return descriptor;
  }
}

export default SceneObject;
