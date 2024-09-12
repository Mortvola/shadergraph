import type { SceneObjectComponent, TransformPropsInterface } from "../../Renderer/Types";
import { ComponentType } from "../../Renderer/Types";
import type { PrefabNodeDescriptor } from "./Types";
import type { PrefabNodeInterface } from "./Types";
import type { PrefabInterface } from "./Types";
import TransformProps from "../../Renderer/Properties/TransformProps";
import ParticleSystemProps from "../../Renderer/ParticleSystem/ParticleSystemProps";
import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import LightProps from "../../Renderer/Properties/LightProps";
import ObjectBase from "./ObjectBase";

class PrefabNode extends ObjectBase implements PrefabNodeInterface {
  components: SceneObjectComponent[] = []

  nodes: PrefabNode[] = [];

  parent: PrefabNode | null = null;

  transformProps: TransformPropsInterface = new TransformProps();

  prefab: PrefabInterface;

  constructor(prefab: PrefabInterface, id = -1, name?: string) {
    super(id, name ?? `Prefab Node ${Math.abs(id)}`)

    this.prefab = prefab;
  }

  static fromDescriptor(prefab: PrefabInterface, descriptor?: PrefabNodeDescriptor): PrefabNode {
    const prefabNode = new PrefabNode(prefab);

    if (descriptor) {
      prefabNode.id = descriptor.id;
      prefabNode.name = descriptor.name;

      prefabNode.transformProps = new TransformProps(descriptor.transformProps)

      prefabNode.components = 
        descriptor.components.map((component) => {
          switch (component.type) {
            case ComponentType.ParticleSystem: {
              const props = new ParticleSystemProps(component.props as ParticleSystemPropsDescriptor)

              props.onChange = prefabNode.onChange
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
          .filter((c) => c !== undefined)

      prefabNode.nodes = descriptor.nodes.map((nodeDescriptor) => {
        return PrefabNode.fromDescriptor(prefab, nodeDescriptor)
      })

      for (const node of prefabNode.nodes) {
        node.parent = prefabNode;
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

  onChange = () => {
    if (this.prefab?.autosave) {
      this.prefab?.save();
    }
  }

  detachSelf() {

  }
}

export default PrefabNode;
