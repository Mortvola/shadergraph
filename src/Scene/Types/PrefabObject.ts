import { ComponentType, PrefabComponent } from "../../Renderer/types";
import Entity from "../../State/Entity";
import { PrefabObjectDescriptor, PrefabObjectInterface } from "../../State/types";
import TransformProps from "../../Renderer/TransformProps";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import LightProps from "../../Renderer/Drawables/LightProps";

class PrefabObject extends Entity implements PrefabObjectInterface {
  components: PrefabComponent[] = []

  objects: PrefabObject[] = [];

  parent: PrefabObject | null = null;

  transformProps = new TransformProps();

  constructor(id = -1, name?: string) {
    super(id, name ?? 'Test Prefab')
  }

  static async fromDescriptor(descriptor?: PrefabObjectDescriptor): Promise<PrefabObject> {
    const prefab = new PrefabObject();

    if (descriptor) {
      prefab.id = descriptor.id;
      prefab.name = descriptor.name;

      prefab.transformProps = new TransformProps(descriptor.transformProps)

      prefab.components = (await Promise.all(
        descriptor.components.map(async (component) => {
          switch (component.type) {
            case ComponentType.ParticleSystem: {
              const props = await ParticleSystemProps.create(component.props as ParticleSystemPropsDescriptor)

              return ({ type: component.type, props })
            }

            case ComponentType.Light: {
              const props = new LightProps(component.props as LightProps)

              return ({ type: component.type, props })
            }
          }
        })
      ))
      .filter((c) => c !== undefined)

      prefab.objects = await Promise.all(descriptor.objects.map(async (objectDescriptor) => {
        return PrefabObject.fromDescriptor(objectDescriptor)
      }))

      for (const object of prefab.objects) {
        object.parent = prefab;
      }
    }

    return prefab;
  }

  toDescriptor(): PrefabObjectDescriptor {
    return ({
      id: this.id,
      name: this.name,
      components: this.components.map((c) => ({
        type: c.type,
        props: c.props.toDescriptor(),
      })),
      transformProps: this.transformProps.toDescriptor(),
      objects: this.objects.map((o) => o.toDescriptor()),
    })
  }

  async save(): Promise<void> {
    console.log('save prefab')
  }

  onChange = () => {
    this.save();
  }
}

export default PrefabObject;
