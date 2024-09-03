import { makeObservable, observable, runInAction } from "mobx";
import { vec3 } from "wgpu-matrix";
import type { PrefabInstanceInterface } from "./Types";
import type { PrefabInstanceDescriptor } from "./Types";
import type { SceneObjectDescriptor } from "./Types";
import type { SceneObjectInterface } from "./Types";
import type { SceneObjectBaseInterface } from "./Types";
import type { PrefabInstanceObjectInterface } from "./Types";
import type { PrefabNodeInterface } from "./Types";
import { isPrefabInstanceDescriptor } from "./Types";
import Http from "../../Http/src";
import type { SceneObjectComponent, LightPropsDescriptor, NewSceneObjectComponent,
  TransformPropsInterface} from "../../Renderer/Types";
import {
  ComponentType
} from "../../Renderer/Types";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";
import Light from "../../Renderer/Drawables/Light";
import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import LightProps from "../../Renderer/Properties/LightProps";
import TransformProps from "../../Renderer/Properties/TransformProps";
import PrefabInstance from "./PrefabInstance";
import NodeBase from "./NodeBase";

export class SceneObjectBase extends NodeBase implements SceneObjectBaseInterface {
  components: SceneObjectComponent[] = []

  objects: SceneObjectBase[] = [];

  transformProps: TransformPropsInterface = new TransformProps();

  sceneNode = new SceneNode();

  parent: (SceneObjectBase | SceneObject | PrefabInstanceObject) | null = null;

  nextComponentId = 0;

  autosave = true;

  constructor(id?: number, name?: string) {
    super(id, name ?? `Scene Object ${Math.abs(id ?? 0)}`)
  }

  getObjectId(): number {
    throw new Error('not implemented')
  }

  onChange = (): void => {
    throw new Error('not implemented')
  }

  delete(): void {
    throw new Error('not implemented')
  }

  async save(): Promise<void> {
    throw new Error('not implemented')
  }

  addComponent(component: NewSceneObjectComponent) {
    throw new Error('not implemented')
  }

  removeComponent(component: SceneObjectComponent) {
    throw new Error('not implemented')
  }

  addObject(object: SceneObjectBase) {
    runInAction(async () => {
      this.objects = [
        ...this.objects,
        object,
      ];

      object.parent = this;
      this.sceneNode.addNode(object.sceneNode)

      this.onChange();
    })
  }

  removeObject(object: SceneObjectBase) {
    const index = this.objects.findIndex((o) => o === object)

    if (index !== -1) {
      runInAction(() => {
        this.objects = [
          ...this.objects.slice(0, index),
          ...this.objects.slice(index + 1),
        ]

        this.sceneNode.removeNode(object.sceneNode)

        this.onChange();
      })
    }
  }

  detachSelf() {
    if (this.parent) {
      this.parent.removeObject(this);
    }
  }

  changeName(name: string) {
    runInAction(() => {
      this.name = name;
      this.onChange();
    })
  }

  isAncestor(item: SceneObjectBase): boolean {
    let child: SceneObjectBase | null = this;
    for (;;) {
      if (child === null || child.parent === item) {
        break;
      }

      child = child.parent;
    }

    if (child) {
      return true;
    }

    return false;
  }

  getNextComponentId(): number {
    const nextComponentId = this.nextComponentId;
    this.nextComponentId += 1;

    return nextComponentId;    
  }

  transformChanged = () => {
    vec3.copy(this.transformProps.translate.get(), this.sceneNode.translate)
    vec3.copy(this.transformProps.scale.get(), this.sceneNode.scale)

    this.onChange();
  }
}

class SceneObject extends SceneObjectBase implements SceneObjectInterface {
  constructor(id?: number, name?: string) {
    super(id, name)
    
    makeObservable(this, {
      components: observable,
      objects: observable,
    })
  }

  static async fromServer(itemId: number): Promise<SceneObject | PrefabInstanceObject | undefined> {
    const response = await Http.get<SceneObjectDescriptor | PrefabInstanceDescriptor>(`/api/scene-objects/${itemId}`)

    if (response.ok) {
      const descriptor = await response.body();

      if (isPrefabInstanceDescriptor(descriptor)) {
        const prefabInstace = await PrefabInstance.fromDescriptor(descriptor);

        return prefabInstace?.root;
        // return undefined
      }

      return SceneObject.fromDescriptor(descriptor)
    }  
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
          const child = await SceneObject.fromServer(id);

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

  toDescriptor(): SceneObjectDescriptor {
    return ({
      id: this.id,
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
    })
  }

  async save(): Promise<void> {
    if (this.id < 0) {
      const { id, ...descriptor } = this.toDescriptor();

      const response = await Http.post<Omit<SceneObjectDescriptor, 'id'>, SceneObjectDescriptor>(`/api/scene-objects`, descriptor);

      if (response.ok) {
        const body = await response.body();

        this.id = body.id;
      }  
    }
    else {
      const response = await Http.patch<SceneObjectDescriptor, void>(`/api/scene-objects/${this.id}`, this.toDescriptor());

      if (response.ok) {
  
      }  
    }      
  }

  onChange = () => {
    if (this.autosave) {
      this.save();
    }
  }

  delete(): void {
    console.log('delete scene object')    
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

export class PrefabInstanceObject extends SceneObjectBase implements PrefabInstanceObjectInterface {
  // components: ComponentOverrides[] = [];

  prefabInstance: PrefabInstanceInterface;

  ancestor: PrefabNodeInterface;

  constructor(prefabInstance: PrefabInstanceInterface, ancestor: PrefabNodeInterface) {
    super()

    this.prefabInstance = prefabInstance;
    this.ancestor = ancestor
  }

  getObjectId(): number {
    return this.prefabInstance.id
  }

  onChange = () => {
    console.log('PrefabInstanceObject changed')

    if (this.prefabInstance?.autosave) {
      this.prefabInstance?.save();
    }
  }

  delete(): void {
    // Since one cannot delete an individual node in a pref instance,
    // for all node delete request, send them to the prefab instance
    this.prefabInstance.delete()
  }
}

export default SceneObject;
