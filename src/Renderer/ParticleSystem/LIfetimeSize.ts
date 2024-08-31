import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import PSValue from "./PSValue";
import { LifetimeSizeDescriptor } from "./Types";

class LifetimeSize extends PSModule {
  size: PSValue;

  constructor(onChange?: () => void) {
    super(onChange);

    this.size = new PSValue(onChange);

    makeObservable(this, {
      size: observable,
    })
  }

  copyValues(other: LifetimeSize, noOverrides = true) {
    super.copyValues(other, noOverrides);
    this.size.copyValues(other.size, noOverrides);
  }

  static fromDescriptor(descriptor?: LifetimeSizeDescriptor, onChange?: () => void) {
    const lifetimeSize = new LifetimeSize(onChange);

    if (descriptor) {
      lifetimeSize.enabled = descriptor.enabled;
      lifetimeSize.size = PSValue.fromDescriptor(descriptor.size, onChange);  
    }

    return lifetimeSize;
  }

  toDescriptor(): LifetimeSizeDescriptor {
    return ({
      enabled: this.enabled,
      size: this.size.toDescriptor(),
    })
  }
}

export default LifetimeSize;
