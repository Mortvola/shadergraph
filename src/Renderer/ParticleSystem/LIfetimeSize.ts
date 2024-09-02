import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import PSValue from "../Properties/PSValue";
import { LifetimeSizeDescriptor } from "./Types";
import { removeUndefinedKeys } from "../Properties/Types";

class LifetimeSize extends PSModule {
  size: PSValue;

  constructor(descriptor?: LifetimeSizeDescriptor, onChange?: () => void, previousProps?: LifetimeSize) {
    super(descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.size = new PSValue(descriptor?.size, undefined, onChange, previousProps?.size);

    makeObservable(this, {
      size: observable,
    })
  }

  copyProps(other: LifetimeSize, noOverrides = true) {
    super.copyProps(other, noOverrides);
    this.size.copyProp(other.size, noOverrides);
  }

  hasOverrides() {
    return (
      super.hasOverrides()
      || this.size.override
    )
  }

  applyOverrides(descriptor?: LifetimeSizeDescriptor) {
    this.enabled.set(descriptor?.enabled, true)
    this.size.applyOverrides(descriptor?.size)
  }

  toDescriptor(overridesOnly = false): LifetimeSizeDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      size: this.size.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeSize;
