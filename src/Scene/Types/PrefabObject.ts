import { vec3, Vec3 } from "wgpu-matrix";
import { PrefabComponent } from "../../Renderer/types";
import Entity from "../../State/Entity";
import { PrefabObjectDescriptor, PrefabObjectInterface } from "../../State/types";

type TransformProps = {
  translate: Vec3,
  rotate: Vec3,
  scale: Vec3,
}

class PrefabObject extends Entity implements PrefabObjectInterface {
  components: PrefabComponent[] = []

  objects: PrefabObject[] = [];

  parent: PrefabObject | null = null;

  transformProps: TransformProps = {
    translate: vec3.create(0, 0, 0),
    rotate: vec3.create(0, 0, 0),
    scale: vec3.create(1, 1, 1),  
  };

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
}

export default PrefabObject;
