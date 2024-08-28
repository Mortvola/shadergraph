import { makeObservable, observable, runInAction } from "mobx";
import Entity from "../../State/Entity";
import {
  ObjectType, PrefabNodeInterface, SceneObjectDescriptor, SceneObjectInterface,
  PrefabInstanceDescriptor, isPrefabInstanceDescriptor,
  PrefabInstanceInterface,
} from "../../State/types";
import Http from "../../Http/src";
import { ComponentType, SceneObjectComponent, LightPropsDescriptor } from "../../Renderer/types";
import { vec3 } from "wgpu-matrix";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";
import Light from "../../Renderer/Drawables/Light";
import { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import LightProps from "../../Renderer/Drawables/LightProps";
import TransformProps from "../../Renderer/TransformProps";
import PrefabInstance from "./PrefabInstance";

class SceneObject extends Entity implements SceneObjectInterface {
  components: SceneObjectComponent[] = []

  objects: SceneObject[] = [];

  transformProps = new TransformProps();

  sceneNode = new SceneNode();

  parent: SceneObject | null = null;

  prefabNode: PrefabNodeInterface | null = null;

  constructor(id?: number, name?: string, items: SceneObjectComponent[] = []) {
    super(id, name ?? `Scene Object ${Math.abs(id ?? 0)}`)
    
    this.components = items.map((i, index) => ({
      ...i,
      key: index,
    }));

    makeObservable(this, {
      components: observable,
      objects: observable,
    })
  }

  static async fromServer(objectType: ObjectType, itemId: number): Promise<SceneObject | undefined> {
    if (objectType === ObjectType.Object) {
      const response = await Http.get<SceneObjectDescriptor | PrefabInstanceDescriptor>(`/scene-objects/${itemId}`)

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
    else if (objectType === ObjectType.Prefab) {

    }
  }

  static async fromDescriptor(descriptor?: SceneObjectDescriptor) {
    const object = new SceneObject();

    if (descriptor) {
      object.id = descriptor.id ?? object.id;
      object.name = descriptor?.name ?? object.name;

      const transformProps = new TransformProps();
      transformProps.translate = vec3.create(...(descriptor.object.translate ?? [0, 0, 0]));
      transformProps.rotate = vec3.create(...(descriptor.object.rotate ?? [0, 0, 0]));
      transformProps.scale = vec3.create(...(descriptor.object.scale ?? [1, 1, 1]));
      
      object.transformProps = transformProps;
      object.transformProps.onChange = object.onChange

      let components = descriptor.object.components;
      if (!components) {
        components = descriptor.object.items;
      }

      if (components) {
        object.components = (await Promise.all(components.map(async (c) => {
          switch (c.type) {
            case ComponentType.ParticleSystem:
              let propsDescriptor = c.props as ParticleSystemPropsDescriptor;
              if (!propsDescriptor) {
                propsDescriptor = c.item as ParticleSystemPropsDescriptor;
              }

              const props = await ParticleSystemProps.create(propsDescriptor);
              props.onChange = object.onChange;

              const ps = new ParticleSystem(props)

              object.sceneNode.addComponent(ps)

              return {
                type: c.type,
                props,
                object: ps,
              }

            case ComponentType.Light: {
              let propsDescriptor = c.props as LightPropsDescriptor;
              if (!propsDescriptor) {
                propsDescriptor = c.item as LightPropsDescriptor;
              }

              const props = new LightProps(propsDescriptor);
              props.onChange = object.onChange;

              const light = new Light(props);

              object.sceneNode.addComponent(light)

              return {
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
          let child: SceneObject | undefined = undefined;
          if (typeof id === 'number') {
            child = await SceneObject.fromServer(ObjectType.Object, id);
          }
          else {
            child = await SceneObject.fromServer(id.type, id.id);
          }

          if (child) {
            child.parent = object
            object.sceneNode.addNode(child.sceneNode)
          }

          return child;
        })))
        .filter((o) => o !== undefined);
      }

      // Fix any scale values that are zero.
      for (let i = 0; i < object.transformProps.scale.length; i += 1) {
        if (object.transformProps.scale[i] === 0) {
          object.transformProps.scale[i] = 1;
        }  
      }

      object.sceneNode.translate = object.transformProps.translate;
    }

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
          type: c.type,
          props: c.props.toDescriptor(),
        })),
        objects: this.objects.map((o) => {
          return (o.getObjectId())
        }),
        translate: [...this.transformProps.translate],
        rotate: [...this.transformProps.rotate],
        scale: [...this.transformProps.scale],  
      }
    })
  }

  async save(): Promise<void> {
    if (!this.prefabNode) {
      if (this.id < 0) {
        const response = await Http.post<SceneObjectDescriptor, SceneObjectDescriptor>(`/scene-objects`, this.toDescriptor());

        if (response.ok) {
          const body = await response.body();

          if (body.id !== undefined) {
            this.id = body.id;
          }
        }  
      }
      else {
        const response = await Http.patch<SceneObjectDescriptor, void>(`/scene-objects/${this.id}`, this.toDescriptor());

        if (response.ok) {
    
        }  
      }      
    }
  }

  changeName(name: string) {
    runInAction(() => {
      this.name = name;
      this.onChange();
    })
  }

  onChange = () => {
    this.save();
  }

  delete(): void {
    console.log('delete scene object')    
  }

  addComponent(component: SceneObjectComponent) {
    this.components = [
      ...this.components,
      component,
    ];

    component.props.onChange = this.onChange;

    if (component.object) {
      this.sceneNode.addComponent(component.object)
    }

    this.onChange()
  }

  removeComponent(component: SceneObjectComponent) {
    const index = this.components.findIndex((i) => i.key === component.key)

    if (index !== -1) {
      this.components = [
        ...this.components.slice(0, index),
        ...this.components.slice(index + 1),
      ]

      if (component.object) {
        this.sceneNode.removeComponent(component.object)
      }

      this.onChange()
    }
  }

  addObject(object: SceneObject) {
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

  removeObject(object: SceneObject) {
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

  isAncestor(item: SceneObjectInterface): boolean {
    let child: SceneObjectInterface | null = this;
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
}

export class PrefabInstanceObject extends SceneObject {
  prefabInstance: PrefabInstanceInterface;

  constructor(prefabInstance: PrefabInstanceInterface) {
    super()

    this.prefabInstance = prefabInstance;
  }

  getObjectId(): number {
    return this.prefabInstance.id
  }

  onChange = () => {
    console.log('PrefabInstanceObject changed')

    this.prefabInstance?.save();
  }

  delete(): void {
    // Since one cannot delete an individual node in a pref instance,
    // for all node delete request, send them to the prefab instance
    this.prefabInstance.delete()
  }
}

export default SceneObject;
