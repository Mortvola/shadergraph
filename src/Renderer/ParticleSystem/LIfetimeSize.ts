import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import PSValue from "./PSValue";
import { LifetimeSizeDescriptor } from "./Types";
import { removeUndefinedKeys } from "../Properties/Types";

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

  hasOverrides() {
    return (
      super.hasOverrides()
      || this.size.override
    )
  }

  static fromDescriptor(descriptor?: LifetimeSizeDescriptor, onChange?: () => void) {
    const lifetimeSize = new LifetimeSize(onChange);

    if (descriptor) {
      lifetimeSize.enabled = descriptor.enabled ?? false;
      lifetimeSize.size = PSValue.fromDescriptor(descriptor.size, onChange);  
    }

    return lifetimeSize;
  }

  applyOverrides(descriptor?: LifetimeSizeDescriptor) {
    this._enabled.applyOverride(descriptor?.enabled)
    this.size.applyOverrides(descriptor?.size)
  }

  toDescriptor(overridesOnly = false): LifetimeSizeDescriptor | undefined {
    const descriptor = {
      enabled: this._enabled.toDescriptor(overridesOnly),
      size: this.size.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeSize;
