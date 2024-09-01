import { makeObservable, observable } from "mobx";
import { LifetimeColorDescriptor } from "./Types";
import PSColor from "./PSColor";
import PSModule from "./PSModule";
import { removeUndefinedKeys } from "../Properties/Types";

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

  hasOverrides(): boolean {
    return (
      super.hasOverrides()
      || this.color.override
    )
  }

  static fromDescriptor(descriptor?: LifetimeColorDescriptor, onChange?: () => void) {
    const lifetimeColor = new LifetimeColor(onChange);

    if (descriptor) {
      lifetimeColor.enabled = descriptor.enabled ?? false;
      lifetimeColor.color = PSColor.fromDescriptor(descriptor.color, onChange);  
    }

    return lifetimeColor;
  }

  applyOverrides(descriptor?: LifetimeColorDescriptor) {
    this._enabled.applyOverride(descriptor?.enabled)
    this.color.applyOverrides(descriptor?.color)
  }

  toDescriptor(overridesOnly = false): LifetimeColorDescriptor | undefined {
    const descriptor = {
      enabled: this._enabled.toDescriptor(overridesOnly),
      color: this.color.toDescriptor(overridesOnly),
    };

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeColor;
