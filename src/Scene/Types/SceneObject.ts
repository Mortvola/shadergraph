import { observable } from "mobx";
import {
  ComponentType, type LightPropsDescriptor, type NewSceneObjectComponent,
  type SceneObjectComponent, type TransformPropsInterface,
} from "../../Renderer/Types";
import { ObjectType, type SceneObjectInterface, type SceneObjectDescriptor } from "./Types";
import TransformProps from "../../Renderer/Properties/TransformProps";
import type TreeNode from "./TreeNode";
import { objectManager } from "./ObjectManager";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import { type ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import LightProps from "../../Renderer/Properties/LightProps";

  
class SceneObject implements SceneObjectInterface {
  @observable
  accessor components: SceneObjectComponent[] = []

  componentOverrides: SceneObjectComponent[] = []

  transformProps: TransformPropsInterface = new TransformProps();

  baseObject?: SceneObject

  derivedObjects: SceneObject[] = []

  nodeId?: number;

  treeId?: number;

  treeNode?: TreeNode;

  nextComponentId = 0;

  autosave = true;

  static async fromDescriptor(descriptor?: SceneObjectDescriptor, baseObject?: SceneObject) {
    const object = new SceneObject();
    object.autosave = false;

    if (descriptor) {
      object.nodeId = descriptor.nodeId;
      object.treeId = descriptor.treeId;

      if (baseObject) {
        object.components = baseObject.components.map((c) => {
          const componentDescriptor = descriptor?.object.components.find((component) => (
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
    
              return {
                id: c.id,
                type: c.type,
                props: props,
              }
            }
    
            case ComponentType.Light: {
    
              return {
                id: c.id,
                type: c.type,
                props: c.props,
              }
            }
          }    
        })
          .filter((c) => c !== undefined)

        object.baseObject = baseObject

        object.transformProps = new TransformProps(
          descriptor.object.transformProps,
          object.transformChanged,
          baseObject.transformProps,
        );
      }
      else {
        const components = descriptor.object.components;

        if (components) {
          object.components = components.map((c) => {
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
          })
            .filter((c) => c !== undefined)  
        }

        object.transformProps = new TransformProps(descriptor.object.transformProps, object.transformChanged);
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

  async save(): Promise<void> {
    if (this.nodeId === undefined) {
      await objectManager.add(this, this.treeNode?.name ?? 'Unnamed')
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
    this.treeNode?.transformChanged()

    this.onChange();
  }

  isPrefabInstanceRoot(): boolean {
    if (this.treeNode?.treeId !== undefined && this.treeNode.treeId !== this.treeNode.parent?.treeId) {
      return true;
    }
  
    return false;
  }

  toDescriptor(): SceneObjectDescriptor | Omit<SceneObjectDescriptor, 'nodeId'> {
    const descriptor = {
      nodeId: this.nodeId,
      object: {
        type: ObjectType.NodeObject,
        components: this.components.map((c) => ({
          id: c.id,
          type: c.type,
          props: c.props.toDescriptor(),
        }))
          .filter((c) => c.props !== undefined),
        transformProps: this.transformProps.toDescriptor(/*this.baseObject !== undefined*/)!,
        nextComponentId: this.nextComponentId,
      }
    }

    return descriptor;
  }
}

export default SceneObject;
