import { makeObservable, observable } from "mobx";
import type { LifetimeVelocityDescriptor } from "./Types";
import PSModule from "./PSModule";
import PSValue from "../Properties/PSValue";
import type { PropsBase} from "../Properties/Types";
import { removeUndefinedKeys } from "../Properties/Types";

class LifetimeVelocity extends PSModule {
  speedModifier: PSValue;

  constructor(props: PropsBase, descriptor?: LifetimeVelocityDescriptor, onChange?: () => void, previousProps?: LifetimeVelocity) {
    super(props, descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.speedModifier = new PSValue('Speed Modifier', props, descriptor?.speedModifier, undefined, onChange, previousProps?.speedModifier);

    makeObservable(this, {
      speedModifier: observable,
    })
  }

  getOverrides() {
    return [
      this.speedModifier.getOverrides(),
    ]
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
