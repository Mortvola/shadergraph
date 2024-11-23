import PSModule from '../Properties/PSModule';
import {
  isPSValue3DDescriptor,
  type PSValue3DDescriptor,
  type PSValueDescriptor,
  PSValueType,
  type LifetimeSizeDescriptor,
} from './Types';
import type PropsBase from '../Properties/PropsBase';
import { removeUndefinedKeys } from '../Properties/Types';
import PSValue3D from '../Properties/PSValue3D';

class LifetimeSize extends PSModule {
  size: PSValue3D;

  constructor(
    props: PropsBase, descriptor?: LifetimeSizeDescriptor, onChange?: () => void,
  ) {
    super(props, descriptor?.enabled, undefined, onChange);

    if ( descriptor?.size === undefined || isPSValue3DDescriptor(descriptor?.size)) {
      this.size = new PSValue3D(props, descriptor?.size, undefined, onChange);
    }
    else {
      const valueDescriptor: PSValueDescriptor = descriptor?.size ?? { type: PSValueType.Constant, value: [1, 1] }
      const tmpDescriptor: PSValue3DDescriptor = {
        separateAxes: false,
        type: descriptor?.size?.type ?? PSValueType.Constant,
        values: [valueDescriptor, valueDescriptor, valueDescriptor],
      }

      this.size = new PSValue3D(props, tmpDescriptor, undefined, onChange);
    }
  }

  update(descriptor?: LifetimeSizeDescriptor) {

  }

  toDescriptor(overridesOnly: boolean): LifetimeSizeDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      size: this.size.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeSize;
