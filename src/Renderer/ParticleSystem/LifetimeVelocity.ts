import { makeObservable, observable } from 'mobx';
import type { LifetimeVelocityDescriptor } from './Types';
import PSModule from '../Properties/PSModule';
import PSValue from '../Properties/PSValue';
import { removeUndefinedKeys } from '../Properties/Types';

class LifetimeVelocity extends PSModule {
  speedModifier: PSValue;

  constructor(
    descriptor?: LifetimeVelocityDescriptor, onChange?: () => void,
  ) {
    super(descriptor?.enabled, undefined, onChange);

    this.speedModifier = new PSValue(
      descriptor?.speedModifier, undefined, onChange,
    );

    makeObservable(this, {
      speedModifier: observable,
    })
  }

  update(_descriptor?: LifetimeVelocityDescriptor) {

  }

  toDescriptor(overridesOnly: boolean): LifetimeVelocityDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      speedModifier: this.speedModifier.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeVelocity;
