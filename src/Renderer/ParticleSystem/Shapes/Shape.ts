import type { ShapeDescriptor} from '../Types';
import { ShapeType } from '../Types';
import Cone from './Cone';
import type { Vec4 } from 'wgpu-matrix';
import { vec4 } from 'wgpu-matrix';
import Sphere from './Sphere';
import PSModule from '../../Properties/PSModule';
import type PropsBase from '../../Properties/PropsBase';
import { removeUndefinedKeys } from '../../Properties/Types';
import { PSShapeType } from '../../Properties/Property';

class Shape extends PSModule {
  type: PSShapeType;

  cone: Cone;

  sphere: Sphere;

  hemisphere: Sphere;

  constructor(
    props: PropsBase,
    descriptor?: ShapeDescriptor,
    onChange?: () => void,
    previousProps?: Shape,
  ) {
    const defaultDescriptor: ShapeDescriptor = { enabled: true, type: ShapeType.Cone, };

    super(props, descriptor?.enabled, defaultDescriptor.enabled, onChange, previousProps?.enabled);

    this.type = new PSShapeType('Shape', props, descriptor?.type, defaultDescriptor?.type, onChange, previousProps?.type)

    this.cone = new Cone(props, descriptor?.cone, onChange, previousProps?.cone);
    this.sphere = new Sphere(props, false, descriptor?.sphere, onChange, previousProps?.sphere);
    this.hemisphere = new Sphere(props, true, descriptor?.hemisphere, onChange, previousProps?.hemisphere);
  }

  toDescriptor(): ShapeDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(),
      type: this.type.toDescriptor(),
      cone: this.cone.toDescriptor(),
      sphere: this.sphere.toDescriptor(),
      hemisphere: this.hemisphere.toDescriptor(),
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
