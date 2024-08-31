import { makeObservable, observable } from "mobx";
import { LifetimeColorDescriptor } from "./Types";
import PSColor from "./PSColor";
import PSModule from "./PSModule";

class LifetimeColor extends PSModule {
  color: PSColor;

  constructor(onChange?: () => void) {
    super(onChange);

    this.color = new PSColor(onChange);

    makeObservable(this, {
      color: observable,
    })
  }

  copyValues(other: LifetimeColor, noOverrides = true) {
    super.copyValues(other, noOverrides);
    this.color.copyValues(other.color, noOverrides);
  }

  static fromDescriptor(descriptor?: LifetimeColorDescriptor, onChange?: () => void) {
    const lifetimeColor = new LifetimeColor(onChange);

    if (descriptor) {
      lifetimeColor.enabled = descriptor.enabled;
      lifetimeColor.color = PSColor.fromDescriptor(descriptor.color, onChange);  
    }

    return lifetimeColor;
  }

  toDescriptor(): LifetimeColorDescriptor {
    return ({
      enabled: this.enabled,
      color: this.color.toDescriptor(),
    })
  }
}

export default LifetimeColor;
