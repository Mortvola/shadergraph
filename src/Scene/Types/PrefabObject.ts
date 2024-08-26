import { PrefabComponent } from "../../Renderer/types";
import Entity from "../../State/Entity";
import { PrefabObjectDescriptor, PrefabObjectInterface } from "../../State/types";
import TransformProps from "../../Renderer/TransformProps";

class PrefabObject extends Entity implements PrefabObjectInterface {
  components: PrefabComponent[] = []

  objects: PrefabObject[] = [];

  parent: PrefabObject | null = null;

  transformProps = new TransformProps();

  constructor(id = -1, name?: string) {
    super(-1, name ?? 'Test Prefab')
  }

  toDescriptor(): PrefabObjectDescriptor {
    return ({
      components: this.components.map((c) => ({
        type: c.type,
        props: c.props.toDescriptor(),
      })),
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
