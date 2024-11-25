import { makeObservable, observable } from 'mobx';
import type { LifetimeColorDescriptor } from './Types';
import PSColor from '../Properties/PSColor';
import PSModule from '../Properties/PSModule';
import { removeUndefinedKeys } from '../Properties/Types';

class LifetimeColor extends PSModule {
  color: PSColor;

  constructor(
    descriptor?: LifetimeColorDescriptor, onChange?: () => void,
  ) {
    super(descriptor?.enabled, undefined, onChange);

    this.color = new PSColor(descriptor?.color, onChange);

    makeObservable(this, {
      color: observable,
    })
  }

  update(_descriptor?: LifetimeColorDescriptor) {
  }

  toDescriptor(overridesOnly: boolean): LifetimeColorDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      color: this.color.toDescriptor(overridesOnly),
    };

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeColor;
