import { makeObservable, observable, runInAction } from "mobx";
import Entity from "../../State/Entity";
import { PrefabObjectInterface, SceneObjectDescriptor, SceneObjectInterface } from "../../State/types";
import Http from "../../Http/src";
import { ComponentType, SceneObjectComponent, LightInterface, ParticleSystemInterface, LightPropsDescriptor, LightPropsInterface } from "../../Renderer/types";
import { vec3 } from "wgpu-matrix";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";
import Light from "../../Renderer/Drawables/Light";
import { ParticleSystemPropsDescriptor, ParticleSystemPropsInterface } from "../../Renderer/ParticleSystem/Types";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import PrefabObject from "./PrefabObject";
import LightProps from "../../Renderer/Drawables/LightProps";
import TransformProps from "../../Renderer/TransformProps";

let nextObjectId = 0;

const getNextObjectId = () => {
  nextObjectId -= 1;
  
  return nextObjectId;
}

class SceneObject extends Entity implements SceneObjectInterface {
  components: SceneObjectComponent[] = []

  objects: SceneObject[] = [];

  transformProps = new TransformProps();

  sceneNode = new SceneNode();

  parent: SceneObject | null = null;

  prefab: PrefabObjectInterface | null = null;

  constructor(id = getNextObjectId(), name?: string, items: SceneObjectComponent[] = []) {
    super(id, name ?? `Scene Object ${Math.abs(id)}`)
    
    this.components = items.map((i, index) => ({
      ...i,
      key: index,
    }));

    makeObservable(this, {
      components: observable,
      objects: observable,
    })
  }

  static async fromServer(itemId: number): Promise<SceneObject | undefined> {
    const response = await Http.get<SceneObjectDescriptor>(`/scene-objects/${itemId}`)

    if (response.ok) {
      const descriptor = await response.body();

      return SceneObject.fromDescriptor(descriptor)
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
      for (let i = 0; i < object.transformProps.scale.length; i += 1) {
        if (object.transformProps.scale[i] === 0) {
          object.transformProps.scale[i] = 1;
        }  
      }

      object.sceneNode.translate = object.transformProps.translate;
    }

    return object;
  }

  static fromPrefab(prefab: PrefabObjectInterface): SceneObject {
    const object = new SceneObject();

    object.name = prefab.name;

    object.components = prefab.components.map((c) => {
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
    
    object.objects = prefab.objects.map((p) => SceneObject.fromPrefab(p));

    for (const child of object.objects) {
      child.parent = object;
      object.sceneNode.addNode(child.sceneNode)
    }

    object.sceneNode.translate = object.transformProps.translate;

    object.prefab = prefab;

    return object;
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
        objects: this.objects.map((o) => o.id),
        translate: [...this.transformProps.translate],
        rotate: [...this.transformProps.rotate],
        scale: [...this.transformProps.scale],  
      }
    })
  }

  async save(): Promise<void> {
    if (!this.prefab) {
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
      this.save();
    })
  }

  onChange = () => {
    this.save();
  }

  addComponent(component: SceneObjectComponent) {
    this.components = [
      ...this.components,
      component,
    ];

    component.props.onChange = this.onChange;

    if (component.type === ComponentType.ParticleSystem) {
      this.sceneNode.addComponent(component.object as ParticleSystemInterface)
    }
    else if (component.type === ComponentType.Light) {
      this.sceneNode.addComponent(component.object as LightInterface);
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

      this.save();
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

        this.save();
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

  createPrefab(): PrefabObject | undefined {
    // Are we currently linked into the scene?

    // Traverse the object tree and clone each of the nodes. We will need to
    // 1. Move the scene node from the original nodes to the new ones
    // 2. Reference the properties for each of the components found in the original nodes
    // 3. Mark the link from the parent to this need as a prefab connection.
    let stack: { object: SceneObject, parent: PrefabObject | null }[] = [{ object: this, parent: null }];
    let prefabRoot: PrefabObject | undefined = undefined;
    let id = 0;

    while (stack.length > 0) {
      let { object, parent } = stack[0];
      stack = stack.slice(1);

      const prefabObject = new PrefabObject(id);
      id += 1;

      // Add the current objects children to the stack
      stack = stack.concat(object.objects.map((o) => ({
        object: o,
        parent: prefabObject,
      })));

      prefabObject.name = object.name;

      // Set the transform values (translate, rotate and scale)
      // The root node will get its own copy while all the other nodes
      // will reference the prefab's value.
      if (!prefabRoot) {
        const transformProps = new TransformProps();

        transformProps.translate = vec3.clone(object.transformProps.translate);
        transformProps.rotate = vec3.clone(object.transformProps.rotate);
        transformProps.scale = vec3.clone(object.transformProps.scale);

        prefabObject.transformProps = transformProps;
        transformProps.onChange = prefabObject.onChange;

        prefabRoot = prefabObject;
      }
      else {
        // Have the prefab object referencd the object's transform props.
        // Set the onChange method on the transform props to the ROOT prefab object.
        prefabObject.transformProps = object.transformProps;
        prefabObject.transformProps.onChange = prefabRoot.onChange
      }

      // Add a reference to each of the components found in the original node.
      prefabObject.components = object.components.map((item) => ({
        type: item.type,
        props: item.props,
      }))

      // Link the prefabObject with its parent.
      if (parent) {
        prefabObject.parent = parent;
        parent.objects.push(prefabObject)
      }

      object.prefab = prefabObject;
    }

    return prefabRoot;
  }
}

export default SceneObject;
