import { makeObservable, observable, runInAction } from "mobx";
import Entity from "../../State/Entity";
import { SceneObjectDescriptor, SceneObjectInterface } from "../../State/types";
import Http from "../../Http/src";
import { ComponentType, GameObjectItem, LightDescriptor, ParticleSystemInterface } from "../../Renderer/types";
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

  translate = vec3.create(0, 0, 0);

  rotate = vec3.create(0, 0, 0);

  scale = vec3.create(1, 1, 1);

  sceneNode: SceneNode | null = null;

  constructor(id = getNextObjectId(), name?: string, items: GameObjectItem[] = []) {
    super(id, name ?? `Scene Object ${Math.abs(id)}`)
    
    this.items = items.map((i, index) => ({
      ...i,
      key: index,
    }));

    makeObservable(this, {
      items: observable,
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
      object.translate = vec3.create(...descriptor.object.translate)
      object.rotate = vec3.create(...descriptor.object.rotate)
      object.scale = vec3.create(...descriptor.object.scale)
      object.items = (await Promise.all(descriptor.object.components.map(async (c) => {
        switch (c.type) {
          case ComponentType.ParticleSystem:
            const psDescriptor = c.item as ParticleSystemDescriptor;

            const ps = await ParticleSystem.create(-1, psDescriptor)
            ps.onChange = object.onChange;

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

            return {
              type: c.type,
              item: light,
            }
          }
        }

        return undefined
      })))
      .filter((c) => c !== undefined)

      // Fix any scale values that are zero.
      for (let i = 0; i < object.scale.length; i += 1) {
        if (object.scale[i] === 0) {
          object.scale[i] = 1;
        }  
      }
    }

    return object;
  }

  toDescriptor(): SceneObjectDescriptor {
    return ({
      id: this.id,
      name: this.name,
      object: {
        components: this.items.map((c) => c.item.toDescriptor()),
        objects: [],
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

  onChange = () => {
    this.save();
  }

  addComponent(component: GameObjectItem) {
    this.items = [
      ...this.items,
      component,
    ];

    component.item.onChange = this.onChange;

    if (this.sceneNode) {
      (async () => {
        if (this.sceneNode) {
          if (component.type === ComponentType.ParticleSystem) {
            this.sceneNode.addComponent(component.item as ParticleSystemInterface)
          }
          else if (component.type === ComponentType.Light) {
            const light = new Light();
            this.sceneNode.addComponent(light);
          }
        }
      })()  
    }
  }

  setTranslate(translate: number[]) {
    runInAction(() => {
      this.translate[0] = translate[0];
      this.translate[1] = translate[1];
      this.translate[2] = translate[2];

      this.save();
    })
    
    if (this.sceneNode) {
      this.sceneNode.translate[0] = translate[0];
      this.sceneNode.translate[1] = translate[1];
      this.sceneNode.translate[2] = translate[2];
    }
  }
}

export default SceneObject;
