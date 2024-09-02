import { makeObservable, observable } from "mobx";
import { LifetimeVelocityDescriptor } from "./Types";
import PSModule from "./PSModule";
import PSValue from "../Properties/PSValue";
import { removeUndefinedKeys } from "../Properties/Types";

class LifetimeVelocity extends PSModule {
  speedModifier: PSValue;

  constructor(descriptor?: LifetimeVelocityDescriptor, onChange?: () => void, previousProps?: LifetimeVelocity) {
    super(descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.speedModifier = new PSValue(descriptor?.speedModifier, undefined, onChange, previousProps?.speedModifier);

    makeObservable(this, {
      speedModifier: observable,
    })
  }

  copyProps(other: LifetimeVelocity, noOverrides = true) {
    super.copyProps(other, noOverrides);
    this.speedModifier.copyProp(other.speedModifier, noOverrides)
  }

  hasOverrides(): boolean {
    return (
      super.hasOverrides()
      || this.speedModifier.override
    )
  }

  applyOverrides(descriptor?: LifetimeVelocityDescriptor) {
    this.enabled.set(descriptor?.enabled, true)
    this.speedModifier.applyOverrides(descriptor?.speedModifier)
  }

  toDescriptor(overridesOnly = false): LifetimeVelocityDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      speedModifier: this.speedModifier.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeVelocity;
