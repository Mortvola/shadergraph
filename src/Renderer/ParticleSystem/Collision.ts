import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import { CollisionDescriptor } from "./Types";
import { removeUndefinedKeys } from "../Properties/Types";
import { PSNumber } from "../Properties/Property2";

class Collision extends PSModule {
  bounce: PSNumber

  dampen: PSNumber;

  constructor(onChange?: () => void) {
    super(onChange);

    this.bounce = new PSNumber(1, onChange);
    this.dampen = new PSNumber(0, onChange);
  }

  copyValues(other: Collision, noOverrides = true) {
    super.copyValues(other, noOverrides);
    this.bounce.copyValues(other.bounce, noOverrides);
    this.dampen.copyValues(other.dampen, noOverrides);
  }

  hasOverrides(): boolean {
    return (
      super.hasOverrides()
      || this.bounce.override
      || this.dampen.override
    )
  }

  static fromDescriptor(descriptor: CollisionDescriptor | undefined, onChange?: () => void) {
    const collision = new Collision(onChange);

    if (descriptor) {
      collision.enabled.set(descriptor.enabled ?? false);
      collision.bounce.set(descriptor.bounce ?? 1);
      collision.dampen.set(descriptor.dampen ?? 0);
    }

    return collision;
  }

  applyOverrides(descriptor?: CollisionDescriptor) {
    this.enabled.set(descriptor?.enabled, true)
    this.bounce.set(descriptor?.bounce, true)
    this.dampen.set(descriptor?.dampen, true)
  }

  toDescriptor(overridesOnly = false): CollisionDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      bounce: this.bounce.toDescriptor(overridesOnly),
      dampen: this.dampen.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }

  protected setOnChange(onChange: () => void) {
    super.setOnChange(onChange)

    this.bounce.onChange = onChange;
    this.dampen.onChange = onChange;
  }
}

export default Collision;
