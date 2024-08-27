import { ComponentType, PrefabComponent } from "../../Renderer/types";
import Entity from "../../State/Entity";
import { PrefabNodeDescriptor, PrefabNodeInterface, PrefabObjectInterface } from "../../State/types";
import TransformProps from "../../Renderer/TransformProps";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import LightProps from "../../Renderer/Drawables/LightProps";

class PrefabNode extends Entity implements PrefabNodeInterface {
  components: PrefabComponent[] = []

  nodes: PrefabNode[] = [];

  parentNode: PrefabNode | null = null;

  prefab: PrefabObjectInterface;

  transformProps = new TransformProps();

  constructor(prefab: PrefabObjectInterface, id = -1, name?: string) {
    super(id, name ?? `Prefab Node ${Math.abs(id)}`)

    this.prefab = prefab;
  }

  static async fromDescriptor(prefab: PrefabObjectInterface, descriptor?: PrefabNodeDescriptor): Promise<PrefabNode> {
    const prefabNode = new PrefabNode(prefab);

    if (descriptor) {
      prefabNode.id = descriptor.id;
      prefabNode.name = descriptor.name;

      prefabNode.transformProps = new TransformProps(descriptor.transformProps)

      prefabNode.components = (await Promise.all(
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

      prefabNode.nodes = await Promise.all(descriptor.nodes.map(async (nodeDescriptor) => {
        return PrefabNode.fromDescriptor(prefab, nodeDescriptor)
      }))

      for (const node of prefabNode.nodes) {
        node.parentNode = prefabNode;
      }
    }

    return prefabNode;
  }

  toDescriptor(): PrefabNodeDescriptor {
    return ({
      id: this.id,
      name: this.name,
      components: this.components.map((c) => ({
        type: c.type,
        props: c.props.toDescriptor(),
      })),
      transformProps: this.transformProps.toDescriptor(),
      nodes: this.nodes.map((node) => node.toDescriptor()),
    })
  }

  async save(): Promise<void> {
    console.log('save prefab node')
  }

  onChange = () => {
    this.save();
  }
}

export default PrefabNode;
