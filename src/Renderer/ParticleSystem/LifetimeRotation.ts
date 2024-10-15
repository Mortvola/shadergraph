import PSModule from '../Properties/PSModule';
import {
  type LifetimeRotationDescriptor,
} from './Types';
import type PropsBase from '../Properties/PropsBase';
import { removeUndefinedKeys } from '../Properties/Types';
import PSValue3D from '../Properties/PSValue3D';

class LifetimeRotation extends PSModule {
  angularVelocity: PSValue3D;

  constructor(props: PropsBase, descriptor?: LifetimeRotationDescriptor, onChange?: () => void, previousProps?: LifetimeRotation) {
    super(props, descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.angularVelocity = new PSValue3D('Size', props, descriptor?.angularVelocity, undefined, onChange, previousProps?.angularVelocity);
  }

  toDescriptor(): LifetimeRotationDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(),
      angularVelocity: this.angularVelocity.toDescriptor(),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeRotation;
