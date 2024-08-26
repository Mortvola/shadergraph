import { makeObservable, observable, runInAction } from "mobx";
import Entity from "../../State/Entity";
import { SceneObjectDescriptor, SceneObjectInterface } from "../../State/types";
import Http from "../../Http/src";
import { ComponentType, SceneObjectComponent, LightInterface, ParticleSystemInterface, LightPropsDescriptor } from "../../Renderer/types";
import { vec3 } from "wgpu-matrix";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";
import Light from "../../Renderer/Drawables/Light";
import { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import PrefabObject from "./PrefabObject";
import LightProps from "../../Renderer/Drawables/LightProps";

let nextObjectId = 0;

const getNextObjectId = () => {
  nextObjectId -= 1;
  
  return nextObjectId;
}

class SceneObject extends Entity implements SceneObjectInterface {
  items: SceneObjectComponent[] = []

  objects: SceneObject[] = [];

  translate = vec3.create(0, 0, 0);

  rotate = vec3.create(0, 0, 0);

  scale = vec3.create(1, 1, 1);

  sceneNode = new SceneNode();

  parent: SceneObject | null = null;

  prefab: PrefabObject | null = null;

  constructor(id = getNextObjectId(), name?: string, items: SceneObjectComponent[] = []) {
    super(id, name ?? `Scene Object ${Math.abs(id)}`)
    
    this.items = items.map((i, index) => ({
      ...i,
      key: index,
    }));

    makeObservable(this, {
      items: observable,
      objects: observable,
      translate: observable,
      rotate: observable,
      scale: observable,
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
      object.translate = vec3.create(...(descriptor.object.translate ?? [0, 0, 0]))
      object.rotate = vec3.create(...(descriptor.object.rotate ?? [0, 0, 0]))
      object.scale = vec3.create(...(descriptor.object.scale ?? [1, 1, 1]))

      let components = descriptor.object.components;
      if (!components) {
        components = descriptor.object.items;
      }

      if (components) {
        object.items = (await Promise.all(components.map(async (c) => {
          switch (c.type) {
            case ComponentType.ParticleSystem:
              let propsDescriptor = c.props as ParticleSystemPropsDescriptor;
              if (!propsDescriptor) {
                propsDescriptor = c.item as ParticleSystemPropsDescriptor;
              }

              const props = await ParticleSystemProps.create(propsDescriptor);
              const ps = new ParticleSystem(props)
              props.onChange = object.onChange;

              object.sceneNode.addComponent(ps)

              return {
                type: c.type,
                item: props,
                object: ps,
              }

            case ComponentType.Light: {
              let propsDescriptor = c.props as LightPropsDescriptor;
              if (!propsDescriptor) {
                propsDescriptor = c.item as LightPropsDescriptor;
              }

              const props = new LightProps(propsDescriptor);
              const light = new Light(props);

              object.sceneNode.addComponent(light)

              return {
                type: c.type,
                item: props,
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
      for (let i = 0; i < object.scale.length; i += 1) {
        if (object.scale[i] === 0) {
          object.scale[i] = 1;
        }  
      }

      object.sceneNode.translate[0] = object.translate[0];
      object.sceneNode.translate[1] = object.translate[1];
      object.sceneNode.translate[2] = object.translate[2];  
    }

    return object;
  }

  toDescriptor(): SceneObjectDescriptor {
    return ({
      id: this.id,
      name: this.name,
      object: {
        components: this.items.map((c) => ({
          type: c.type,
          props: c.item.toDescriptor(),
        })),
        objects: this.objects.map((o) => o.id),
        translate: [...this.translate],
        rotate: [...this.rotate],
        scale: [...this.scale],  
      }
    })
  }

  async save(): Promise<void> {
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
    this.items = [
      ...this.items,
      component,
    ];

    component.item.onChange = this.onChange;

    if (component.type === ComponentType.ParticleSystem) {
      this.sceneNode.addComponent(component.object as ParticleSystemInterface)
    }
    else if (component.type === ComponentType.Light) {
      this.sceneNode.addComponent(component.object as LightInterface);
    }
  }

  setTranslate(translate: number[]) {
    runInAction(() => {
      this.translate[0] = translate[0];
      this.translate[1] = translate[1];
      this.translate[2] = translate[2];

      this.save();
    })
    
    this.sceneNode.translate[0] = translate[0];
    this.sceneNode.translate[1] = translate[1];
    this.sceneNode.translate[2] = translate[2];
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
    let stack: SceneObject[] = [this];
    let prefabRoot: PrefabObject | undefined = undefined;

    while (stack.length > 1) {
      let object = stack[0];
      stack = stack.slice(1);

      // Add the current objects children to the stack
      stack = stack.concat(object.objects);

      const prefabObject = new PrefabObject();

      prefabObject.name = object.name;

      // Set the transform values (translate, rotate and scale)
      // The root node will get its own copy while all the other nodes
      // will reference the prefab's value.
      if (!prefabRoot) {
        prefabObject.transformProps.translate = vec3.clone(object.translate);
        prefabObject.transformProps.rotate = vec3.clone(object.rotate);
        prefabObject.transformProps.scale = vec3.clone(object.scale);

        prefabRoot = prefabObject;
      }
      else {
        prefabObject.transformProps.translate = object.translate;
        prefabObject.transformProps.rotate = object.rotate;
        prefabObject.transformProps.scale = object.scale;  
      }

      // Add a reference to each of the components found in the original node.
      prefabObject.components = object.items.map((item) => ({
        type: item.type,
        props: item.item,
      }))

      // Link the prefabObject with its parent.
      if (object.parent?.prefab) {
        prefabObject.parent = object.parent?.prefab;
        prefabObject.parent.objects.push(prefabObject)
      }

      object.prefab = prefabObject;
    }

    return prefabRoot;
  }
}

export default SceneObject;
