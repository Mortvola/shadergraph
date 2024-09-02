import { makeObservable, observable } from "mobx";
import { LifetimeColorDescriptor } from "./Types";
import PSColor from "../Properties/PSColor";
import PSModule from "./PSModule";
import { removeUndefinedKeys } from "../Properties/Types";

class LifetimeColor extends PSModule {
  color: PSColor;

  constructor(descriptor?: LifetimeColorDescriptor, onChange?: () => void, previousProps?: LifetimeColor) {
    super(descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.color = new PSColor(descriptor?.color, onChange, previousProps?.color);

    makeObservable(this, {
      color: observable,
    })
  }

  copyProps(other: LifetimeColor, noOverrides = true) {
    super.copyProps(other, noOverrides);
    this.color.copyValues(other.color, noOverrides);
  }

  hasOverrides(): boolean {
    return (
      super.hasOverrides()
      || this.color.override
    )
  }

  toDescriptor(overridesOnly = false): LifetimeColorDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      color: this.color.toDescriptor(overridesOnly),
    };

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeColor;
