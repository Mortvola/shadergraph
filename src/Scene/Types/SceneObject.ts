import { observable } from 'mobx';
import {
  type ComponentDescriptor,
  type ComponentPropsDescriptor,
  ComponentType, type LightPropsDescriptor, type NewSceneObjectComponent,
  type SceneObjectComponent,
} from '../../Renderer/Types';
import {
  type SceneObjectInterface, type SceneObjectDescriptor,
  type HeaderInterface, type TransformPropsDescriptor,
  type SceneObjectModifications,
  type SceneObjectComponents,
} from './Types';
import TransformProps from '../../Renderer/Properties/TransformProps';
import type TreeNode from './TreeNode';
import ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';
import { type ParticleSystemPropsDescriptor } from '../../Renderer/ParticleSystem/Types';
import LightProps from '../../Renderer/Properties/LightProps';
import { PSString } from '../../Renderer/Properties/Property';
import PropsBase from '../../Renderer/Properties/PropsBase';
import Http from '../../Http/src';

class Header extends PropsBase implements HeaderInterface {
  name: PSString

  constructor() {
    super()

    this.name = new PSString(this)
  }

  toDescriptor(): object | undefined {
    return undefined
  }
}

class SceneObject implements SceneObjectInterface {
  id: number

  header: Header

  @observable
  accessor components: SceneObjectComponents = {}

  node?: TreeNode;

  get isTopLevel(): boolean {
    return this.node?.sceneId === this.node?.scene.root?.sceneId
  }

  // tree?: { id: number, name: string };

  nextComponentId = 0;

  autosave = true;

  get hasOverrides(): boolean {
    for (const t in this.components) {
      if (this.components[t].props.hasOverrides) {
        return true;
      }
    }

    return false;
  }

  constructor(id: number) {
    this.id = id
    this.header = new Header()
  }

  static fromDescriptor(
    descriptor: SceneObjectDescriptor,
    components: Map<number, ComponentDescriptor>,
  ) {
    const object = new SceneObject(descriptor.id);
    object.autosave = false;

    object.header.name = new PSString(
      object.header,
      descriptor.name ?? undefined,
      undefined,
      object.onChange,
    )

    const componentIds = descriptor.components;

    for (const compId of componentIds) {
      const componentDescriptor = components.get(compId)

      if (componentDescriptor) {
        object.createComponent(componentDescriptor)
      }
    }

    object.autosave = true;

    return object;
  }

  createComponent(descriptor: ComponentDescriptor) {
    switch (descriptor.type) {
      case ComponentType.Transform: {
        const props = new TransformProps(
          descriptor.props as TransformPropsDescriptor,
        );

        // Fix any scale values that are zero.
        for (let i = 0; i < props.scale.get().length; i += 1) {
          if (props.scale.get()[i] === 0) {
            props.scale.get()[i] = 1;
          }
        }

        const component: SceneObjectComponent = {
          id: descriptor.id,
          type: descriptor.type,
          props,
        }

        props.onChange = () => {
          console.log('transform changed')
          this.transformChanged()

          this.saveComponent(component)
        }

        props.sceneObject = this;

        this.components[descriptor.type] = component

        break
      }

      case ComponentType.ParticleSystem: {
        const propsDescriptor = descriptor.props as ParticleSystemPropsDescriptor;

        const props = new ParticleSystemProps(propsDescriptor);

        const component: SceneObjectComponent = {
          id: descriptor.id,
          type: descriptor.type,
          props,
        }

        props.onChange = () => { this.saveComponent(component) };
        props.sceneObject = this;

        this.components[descriptor.type] = component

        break;
      }

      case ComponentType.Light: {
        const propsDescriptor = descriptor.props as LightPropsDescriptor;

        const props = new LightProps(propsDescriptor);
        props.onChange = this.onChange;
        props.sceneObject = this;

        const component: SceneObjectComponent = {
          id: descriptor.id,
          type: descriptor.type,
          props,
        }

        this.components[descriptor.type] = component

        break;
      }
    }
  }

  applyModifications(modifications: SceneObjectModifications, override = false) {
    for (const key in modifications) {
      if (key === 'name') {
        if (modifications.name !== undefined) {
          this.header.name.set((modifications.name as unknown) as string, override)
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
      switch (component.type) {
        case ComponentType.Transform: {
          (component.props as TransformProps).applyModifications(
            componentDescriptor as TransformPropsDescriptor,
            override,
          )
          break;
        }

        case ComponentType.ParticleSystem: {
          (component.props as ParticleSystemProps).applyModifications(
            componentDescriptor as ParticleSystemPropsDescriptor,
            override,
          )
          break;
        }
      }
    }
  }

  // static async fromModifications(
  //   modifications: SceneObjectModifications,
  //   baseObject: SceneObjectInterface,
  // ) {
  //   const object = new SceneObject();
  //   object.autosave = false;

  //   object.components = []
  //   object.header.name = new PSString(
  //     'name',
  //     object.header,
  //     modifications?.name as string,
  //     undefined,
  //     object.onModificationChange,
  //     baseObject?.header.name,
  //   )

  //   for (const c of baseObject.components) {
  //     const componentDescriptor: unknown | undefined = modifications[c.type]

  //     switch (c.type) {
  //       case ComponentType.Transform: {
  //         const props = new TransformProps(
  //           componentDescriptor as TransformPropsDescriptor,
  //           object.transformChanged,
  //           baseObject.transformProps,
  //         );

  //         object.components.push({
  //           id: c.id,
  //           type: c.type,
  //           props,
  //         })

  //         object.transformProps = props
  //         break
  //       }

  //       case ComponentType.ParticleSystem: {
  //         const props = new ParticleSystemProps(
  //           componentDescriptor as ParticleSystemPropsDescriptor,
  //           c.props as ParticleSystemProps,
  //         );

  //         props.onChange = object.onModificationChange;
  //         props.sceneObject = object;

  //         object.components.push({
  //           id: c.id,
  //           type: c.type,
  //           props,
  //         })

  //         break
  //       }

  //       case ComponentType.Light: {
  //         object.components.push({
  //           id: c.id,
  //           type: c.type,
  //           props: c.props,
  //         })

  //         break
  //       }
  //     }
  //   }

  //   // let componentDescriptor: unknown | undefined
  //   // if (descriptor?.modifications) {
  //   //   componentDescriptor = descriptor?.modifications[ComponentType.Transform]
  //   // }

  //   // object.transformProps = new TransformProps(
  //   //   componentDescriptor as TransformPropsDescriptor,
  //   //   object.transformChanged,
  //   //   baseObject.transformProps,
  //   // );

  //   object.baseObject = baseObject

  //   object.autosave = true;

  //   return object;
  // }

  // async save(): Promise<void> {
  //   return objectManager.update(this)
  // }

  onChange = () => {
    if (this.autosave) {
      console.log('onChange')
      // this.save();
    }
  }

  async saveComponent(component: SceneObjectComponent) {
    // Is this a component being updated or is a modification to a component being updated?
    if (this.isTopLevel) {
      // A component is being updated.
      const descriptor = component.props.toDescriptor(false);

      if (descriptor) {
        await this.node?.scene.updateObjectComponent(component.id, descriptor)
      }
    } else {
      // A modification to a component is being updated.

      if (this.node === undefined) {
        throw new Error('node is not defined')
      }

      const descriptor = component.props.toDescriptor(true)

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
            name: this.header.name.toDescriptor(true),
            [component.type]: descriptor,
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

  addComponent(component: NewSceneObjectComponent) {
    this.components[component.type] = { ...component, id: this.getNextComponentId() }
    component.props.onChange = this.onChange;

    // if (component.component) {
      // this.renderNode.addComponent(component.component)
    // }

    this.onChange()
  }

  removeComponent(component: SceneObjectComponent) {
    const c = this.components[component.type]

    if (c !== undefined) {
      // this.renderNode.removeComponent(c.component)
      delete this.components[component.type]
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

  // detachSelf() {
  //   // if (this.parent) {
  //   //   this.parent.removeObject(this);
  //   //   this.parent = null;
  //   // }
  // }

  getNextComponentId(): number {
    const nextComponentId = this.nextComponentId;
    this.nextComponentId += 1;

    return nextComponentId;
  }

  transformChanged = () => {
    this.node?.transformChanged()

    this.onChange();
  }

  isPrefabInstanceRoot(): boolean {
    return this.node?.modifierNode !== undefined
  }

  toDescriptor(overridesOnly: boolean): Omit<SceneObjectDescriptor, 'id'> {
    const descriptor = {
      name: this.header.name.toDescriptor(overridesOnly),
      components: Object.keys(this.components).map((c) => this.components[c].id),
    }

    return descriptor;
  }
}

export default SceneObject;
