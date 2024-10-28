import { observable } from 'mobx';
import {
  type ComponentDescriptor,
  ComponentType, type LightPropsDescriptor, type NewSceneObjectComponent,
  type SceneObjectComponent, type TransformPropsInterface,
} from '../../Renderer/Types';
import {
  type SceneObjectInterface, type SceneObjectDescriptor,
  type HeaderInterface, type TransformPropsDescriptor,
  type ModificationEntry,
} from './Types';
import TransformProps from '../../Renderer/Properties/TransformProps';
import type TreeNode from './TreeNode';
import { objectManager } from './ObjectManager';
import ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';
import { type ParticleSystemPropsDescriptor } from '../../Renderer/ParticleSystem/Types';
import LightProps from '../../Renderer/Properties/LightProps';
import { PSString } from '../../Renderer/Properties/Property';
import PropsBase from '../../Renderer/Properties/PropsBase';
import Http from '../../Http/src';
import type ModifierNode from './ModifierNode';

class Header extends PropsBase implements HeaderInterface {
  name: PSString

  constructor() {
    super()

    this.name = new PSString('name', this)
  }

  toDescriptor(): object | undefined {
    return undefined
  }
}

class SceneObject implements SceneObjectInterface {
  header: Header

  @observable
  accessor components: SceneObjectComponent[] = []

  transformProps: TransformPropsInterface = new TransformProps();

  baseObject?: SceneObjectInterface

  node?: TreeNode;

  modifierNode?: ModifierNode;

  modifications?: ModificationEntry;

  tree?: { id: number, name: string };

  nextComponentId = 0;

  autosave = true;

  get hasOverrides(): boolean {
    for (const component of this.components) {
      if (component.props.hasOverrides) {
        return true;
      }
    }

    return false;
  }

  constructor() {
    this.header = new Header()
  }

  static async fromDescriptor(
    descriptor?: SceneObjectDescriptor,
    components?: Map<number, ComponentDescriptor>,
  ) {
    const object = new SceneObject();
    object.autosave = false;

    object.components = []

    object.header.name = new PSString(
      'name',
      object.header,
      descriptor?.name ?? undefined,
      undefined,
      object.onChange,
    )

    const componentIds = descriptor?.components;

    if (componentIds) {
      for (const compId of componentIds) {
        const c = components?.get(compId)

        if (c) {
          switch (c.type) {
            case ComponentType.Transform: {
              const props = new TransformProps(
                c.props as TransformPropsDescriptor,
              );

              const component = {
                id: c.id,
                type: c.type,
                props,
              }

              object.components.push(component)

              props.onChange = () => {
                object.transformChanged()

                object.updateComponent(component)
              }

              object.transformProps = props

              // Fix any scale values that are zero.
              for (let i = 0; i < object.transformProps.scale.get().length; i += 1) {
                if (object.transformProps.scale.get()[i] === 0) {
                  object.transformProps.scale.get()[i] = 1;
                }
              }

              break
            }

            case ComponentType.ParticleSystem: {
              const propsDescriptor = c.props as ParticleSystemPropsDescriptor;

              const props = new ParticleSystemProps(propsDescriptor);

              const component = {
                id: c.id ?? object.getNextComponentId(),
                type: c.type,
                props,
              }

              props.onChange = () => { object.updateComponent(component) };
              props.nodeObject = object;

              object.components.push(component)

              break;
            }

            case ComponentType.Light: {
              const propsDescriptor = c.props as LightPropsDescriptor;

              const props = new LightProps(propsDescriptor);
              props.onChange = object.onChange;
              props.nodeObject = object;

              object.components.push({
                id: c.id ?? object.getNextComponentId(),
                type: c.type,
                props,
              })

              break;
            }
          }
        }
      }
    }

    object.autosave = true;

    return object;
  }

  static async fromModifications(
    modifications: Record<string, unknown>,
    baseObject: SceneObjectInterface,
  ) {
    const object = new SceneObject();
    object.autosave = false;

    object.components = []
    object.header.name = new PSString(
      'name',
      object.header,
      modifications?.name as string,
      undefined,
      object.onModificationChange,
      baseObject?.header.name,
    )

    for (const c of baseObject.components) {
      let componentDescriptor: unknown | undefined
      if (modifications) {
        componentDescriptor = modifications[c.type]
      }

      switch (c.type) {
        case ComponentType.Transform: {
          const props = new TransformProps(
            componentDescriptor as TransformPropsDescriptor,
            object.transformChanged,
            baseObject.transformProps,
          );

          object.components.push({
            id: c.id,
            type: c.type,
            props,
          })

          object.transformProps = props
          break
        }

        case ComponentType.ParticleSystem: {
          const props = new ParticleSystemProps(
            componentDescriptor as ParticleSystemPropsDescriptor,
            c.props as ParticleSystemProps,
          );

          props.onChange = object.onModificationChange;
          props.nodeObject = object;

          object.components.push({
            id: c.id,
            type: c.type,
            props,
          })

          break
        }

        case ComponentType.Light: {
          object.components.push({
            id: c.id,
            type: c.type,
            props: c.props,
          })

          break
        }
      }
    }

    // let componentDescriptor: unknown | undefined
    // if (descriptor?.modifications) {
    //   componentDescriptor = descriptor?.modifications[ComponentType.Transform]
    // }

    // object.transformProps = new TransformProps(
    //   componentDescriptor as TransformPropsDescriptor,
    //   object.transformChanged,
    //   baseObject.transformProps,
    // );

    object.baseObject = baseObject

    object.autosave = true;

    return object;
  }

  async save(): Promise<void> {
    return objectManager.update(this)
  }

  onChange = () => {
    if (this.autosave) {
      this.save();
    }
  }

  async saveModifications(modifications: Record<string, unknown>) {
    if (!this.modifierNode || !this.modifications) {
      throw new Error('modifications not set')
    }

    const response = await Http.put('/api/node-modifications', {
      modifierNodeId: this.modifierNode.id,
      nodeId: this.modifications.nodeId,
      pathId: this.modifications.pathId,
      modifications,
    })

    if (response.ok) {
      this.modifications.modifications = modifications
    }
  }

  onModificationChange = () => {
    if (!this.modifications) {
      throw new Error('modifications not set')
    }

    const modifications: Record<string, unknown> = {}

    modifications['name'] = this.header.name.toDescriptor()

    for (const mod of this.components) {
      const props = mod.props.toDescriptor()

      if (props) {
        modifications[mod.type] = props
      }
    }

    this.saveModifications(modifications)
  }

  async updateComponent(component: SceneObjectComponent) {
    const response = await Http.patch(`/api/components/${component.id}`, component.props.toDescriptor())

    if (response.ok) {
      //
    }
  }

  addComponent(component: NewSceneObjectComponent) {
    this.components = [
      ...this.components,
      {
        id: this.getNextComponentId(),
        ...component,
      },
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

  detachSelf() {
    // if (this.parent) {
    //   this.parent.removeObject(this);
    //   this.parent = null;
    // }
  }

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
    return this.node?.modifications !== undefined
  }

  toDescriptor(): SceneObjectDescriptor {
    if (this.node == null) {
      throw new Error('node not set')
    }

    let pathId: number | undefined
    let modifications: Record<string, unknown> | undefined
    let components: number[] = []

    if (this.modifications) {
      // const path = this.node.getPathId(this.modifierNode)

      // pathId = path.id

      // modifications = {}
      // for (const mod of this.components) {
      //   const props = mod.props.toDescriptor()

      //   if (props) {
      //     modifications[mod.type] = props
      //   }
      // }
    } else {
      components = this.components.map((c) => c.id)
    }

    const descriptor = {
      nodeId: this.node.id,
      name: this.header.name.toDescriptor(),
      // modifierNodeId: this.modifierNode?.id,
      // pathId,
      components,
      // modifications,
      // transformProps: this.transformProps.toDescriptor(/*this.baseObject !== undefined*/)!,
    }

    return descriptor;
  }
}

export default SceneObject;
