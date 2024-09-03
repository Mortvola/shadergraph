import { makeObservable, observable } from "mobx";
import { LifetimeVelocityDescriptor } from "./Types";
import PSModule from "./PSModule";
import PSValue from "../Properties/PSValue";
import { PropsBase, removeUndefinedKeys } from "../Properties/Types";

class LifetimeVelocity extends PSModule {
  speedModifier: PSValue;

  constructor(props: PropsBase, descriptor?: LifetimeVelocityDescriptor, onChange?: () => void, previousProps?: LifetimeVelocity) {
    super(props, descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.speedModifier = new PSValue(props, descriptor?.speedModifier, undefined, onChange, previousProps?.speedModifier);

    makeObservable(this, {
      speedModifier: observable,
    })
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
