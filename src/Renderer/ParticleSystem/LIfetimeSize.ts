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

  toDescriptor(overridesOnly = false): LifetimeSizeDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      size: this.size.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeSize;
