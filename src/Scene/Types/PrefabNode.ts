import type { PrefabComponent, TransformPropsInterface } from "../../Renderer/Types";
import { ComponentType } from "../../Renderer/Types";
import type { PrefabNodeDescriptor, PrefabNodeInterface, PrefabInterface } from "../../State/types";
import TransformProps from "../../Renderer/Properties/TransformProps";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import LightProps from "../../Renderer/Properties/LightProps";
import NodeBase from "./NodeBase";

class PrefabNode extends NodeBase implements PrefabNodeInterface {
  components: PrefabComponent[] = []

  nodes: PrefabNode[] = [];

  parentNode: PrefabNode | null = null;

  prefab: PrefabInterface;

  ancestor?: PrefabNode;

  transformProps: TransformPropsInterface = new TransformProps();

  constructor(prefab: PrefabInterface, id = -1, name?: string) {
    super(id, name ?? `Prefab Node ${Math.abs(id)}`)

    this.prefab = prefab;
  }

  static async fromDescriptor(prefab: PrefabInterface, descriptor?: PrefabNodeDescriptor): Promise<PrefabNode> {
    const prefabNode = new PrefabNode(prefab);

    if (descriptor) {
      prefabNode.id = descriptor.id;
      prefabNode.name = descriptor.name;

      prefabNode.transformProps = new TransformProps(descriptor.transformProps)

      prefabNode.components = (await Promise.all(
        descriptor.components.map(async (component) => {
          switch (component.type) {
            case ComponentType.ParticleSystem: {
              const props = new ParticleSystemProps(component.props as ParticleSystemPropsDescriptor)

              props.node = prefabNode;

              return ({ id: component.id, type: component.type, props })
            }

            case ComponentType.Light: {
              const props = new LightProps(component.props as LightProps)

              props.node = prefabNode;

              return ({ id: component.id, type: component.type, props })
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
        id: c.id,
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
