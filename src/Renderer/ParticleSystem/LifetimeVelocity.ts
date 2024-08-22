import { makeObservable, observable } from "mobx";
import { LifetimeVelocityDescriptor } from "./Types";
import PSModule from "./PSModule";
import PSValue from "./PSValue";

class LifetimeVelocity extends PSModule {
  speedModifier: PSValue;

  constructor(onChange?: () => void) {
    super(onChange);

    this.speedModifier = new PSValue(onChange);

    makeObservable(this, {
      speedModifier: observable,
    })
  }

  static fromDescriptor(descriptor?: LifetimeVelocityDescriptor, onChange?: () => void) {
    const lifetimeVelocity = new LifetimeVelocity(onChange);

    if (descriptor) {
      lifetimeVelocity.enabled = descriptor.enabled;
      lifetimeVelocity.speedModifier = PSValue.fromDescriptor(descriptor.speedModifier, onChange);  
    }

    return lifetimeVelocity;
  }

  toDescriptor(): LifetimeVelocityDescriptor {
    return ({
      enabled: this.enabled,
      speedModifier: this.speedModifier.toDescriptor(),
    })
  }
}

export default LifetimeVelocity;
