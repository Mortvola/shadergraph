import type { ShapeDescriptor} from '../Types';
import { ShapeType } from '../Types';
import Cone from './Cone';
import type { Vec4 } from 'wgpu-matrix';
import { vec4 } from 'wgpu-matrix';
import Sphere from './Sphere';
import PSModule from '../../Properties/PSModule';
import { removeUndefinedKeys } from '../../Properties/Types';
import { PSShapeType } from '../../Properties/Property';

class Shape extends PSModule {
  type: PSShapeType;

  cone: Cone;

  sphere: Sphere;

  hemisphere: Sphere;

  constructor(
    descriptor?: ShapeDescriptor,
    onChange?: () => void,
  ) {
    const defaultDescriptor: ShapeDescriptor = { enabled: true, type: ShapeType.Cone };

    super(descriptor?.enabled, defaultDescriptor.enabled, onChange);

    this.type = new PSShapeType(
      descriptor?.type, defaultDescriptor?.type, onChange,
    )

    this.cone = new Cone(descriptor?.cone, onChange);
    this.sphere = new Sphere(false, descriptor?.sphere, onChange);
    this.hemisphere = new Sphere(true, descriptor?.hemisphere, onChange);
  }

  update(_descriptor?: ShapeDescriptor) {

  }

  toDescriptor(overridesOnly: boolean): ShapeDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      type: this.type.toDescriptor(overridesOnly),
      cone: this.cone.toDescriptor(overridesOnly),
      sphere: this.sphere.toDescriptor(overridesOnly),
      hemisphere: this.hemisphere.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    if (this.enabled.get()) {
      switch (this.type.get()) {
        case ShapeType.Sphere:
          return this.sphere.getPositionAndDirection();

        case ShapeType.Cone:
          return this.cone.getPositionAndDirection();

        case ShapeType.Hemisphere:
          return this.hemisphere.getPositionAndDirection();
      }
    }

    return [vec4.create(0, 0, 0, 1), vec4.create(0, 0, 0, 0)];
  }
}

export default Shape;
