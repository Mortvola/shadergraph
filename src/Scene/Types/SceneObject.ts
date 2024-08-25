import { makeObservable, observable, runInAction } from "mobx";
import Entity from "../../State/Entity";
import { SceneObjectDescriptor, SceneObjectInterface } from "../../State/types";
import Http from "../../Http/src";
import { ComponentType, GameObjectItem, LightDescriptor, LightInterface, ParticleSystemInterface } from "../../Renderer/types";
import { vec3 } from "wgpu-matrix";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";
import Light from "../../Renderer/Drawables/Light";
import { ParticleSystemDescriptor } from "../../Renderer/ParticleSystem/Types";
import ParticleSystem from "../../Renderer/ParticleSystem/ParticleSystem";

let nextObjectId = 0;

const getNextObjectId = () => {
  nextObjectId -= 1;
  
  return nextObjectId;
}

class SceneObject extends Entity implements SceneObjectInterface {
  items: GameObjectItem[] = []

  objects: SceneObject[] = [];

  translate = vec3.create(0, 0, 0);

  rotate = vec3.create(0, 0, 0);

  scale = vec3.create(1, 1, 1);

  sceneNode = new SceneNode();

  parent: SceneObject | null = null;

  constructor(id = getNextObjectId(), name?: string, items: GameObjectItem[] = []) {
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
              const psDescriptor = c.item as ParticleSystemDescriptor;

              const ps = await ParticleSystem.create(-1, psDescriptor)
              ps.onChange = object.onChange;

              object.sceneNode.addComponent(ps)

              return {
                type: c.type,
                item: ps,
              }

            case ComponentType.Light: {
              const lightDescriptor = c.item as LightDescriptor;

              const light = new Light();
              light.color = lightDescriptor.color
              light.constant = lightDescriptor.constant;
              light.linear = lightDescriptor.linear;
              light.quadratic = lightDescriptor.quadratic;

              object.sceneNode.addComponent(light)

              return {
                type: c.type,
                item: light,
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
        components: this.items.map((c) => c.item.toDescriptor()),
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

  addComponent(component: GameObjectItem) {
    this.items = [
      ...this.items,
      component,
    ];

    component.item.onChange = this.onChange;

    if (component.type === ComponentType.ParticleSystem) {
      this.sceneNode.addComponent(component.item as ParticleSystemInterface)
    }
    else if (component.type === ComponentType.Light) {
      this.sceneNode.addComponent(component.item as LightInterface);
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

}

export default SceneObject;
