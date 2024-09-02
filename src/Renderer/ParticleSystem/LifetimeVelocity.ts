import { makeObservable, observable } from "mobx";
import { LifetimeVelocityDescriptor } from "./Types";
import PSModule from "./PSModule";
import PSValue from "../Properties/PSValue";
import { removeUndefinedKeys } from "../Properties/Types";

class LifetimeVelocity extends PSModule {
  speedModifier: PSValue;

  constructor(onChange?: () => void) {
    super(onChange);

    this.speedModifier = new PSValue(onChange);

    makeObservable(this, {
      speedModifier: observable,
    })
  }

  copyValues(other: LifetimeVelocity, noOverrides = true) {
    super.copyValues(other, noOverrides);
    this.speedModifier.copyValues(other.speedModifier, noOverrides)
  }

  hasOverrides(): boolean {
    return (
      super.hasOverrides()
      || this.speedModifier.override
    )
  }

  static fromDescriptor(descriptor?: LifetimeVelocityDescriptor, onChange?: () => void) {
    const lifetimeVelocity = new LifetimeVelocity(onChange);

    if (descriptor) {
      lifetimeVelocity.enabled.set(descriptor.enabled ?? false);
      lifetimeVelocity.speedModifier = PSValue.fromDescriptor(descriptor.speedModifier, onChange);  
    }

    return lifetimeVelocity;
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
