import { makeObservable, observable } from 'mobx';
import type { LifetimeVelocityDescriptor } from './Types';
import PSModule from '../Properties/PSModule';
import PSValue from '../Properties/PSValue';
import type PropsBase from '../Properties/PropsBase';
import { removeUndefinedKeys } from '../Properties/Types';

class LifetimeVelocity extends PSModule {
  speedModifier: PSValue;

  constructor(
    props: PropsBase, descriptor?: LifetimeVelocityDescriptor, onChange?: () => void,
  ) {
    super(props, descriptor?.enabled, undefined, onChange);

    this.speedModifier = new PSValue(
      props, descriptor?.speedModifier, undefined, onChange,
    );

    makeObservable(this, {
      speedModifier: observable,
    })
  }

  update(descriptor?: LifetimeVelocityDescriptor) {

  }

  toDescriptor(): LifetimeVelocityDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(),
      speedModifier: this.speedModifier.toDescriptor(),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeVelocity;
