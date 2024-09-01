import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import { CollisionDescriptor } from "./Types";
import { PSNumber, removeUndefinedKeys } from "../Properties/Types";

class Collision extends PSModule {
  _bounce: PSNumber;

  get bounce(): number {
    return this._bounce.value
  }

  set bounce(value: number) {
    this._bounce.value = { value }
  }

  _dampen: PSNumber;

  get dampen(): number {
    return this._dampen.value
  }

  set dampen(value: number) {
    this._dampen.value = { value }
  }

  constructor(onChange?: () => void) {
    super(onChange);

    this._bounce = new PSNumber(1, onChange);
    this._dampen = new PSNumber(0, onChange);
  
    makeObservable(this, {
      _bounce: observable,
      _dampen: observable,
    })
  }

  copyValues(other: Collision, noOverrides = true) {
    super.copyValues(other, noOverrides);
    this._bounce.copyValues(other._bounce, noOverrides);
    this._dampen.copyValues(other._dampen, noOverrides);
  }

  hasOverrides(): boolean {
    return (
      super.hasOverrides()
      || this._bounce.override
      || this._dampen.override
    )
  }

  static fromDescriptor(descriptor: CollisionDescriptor | undefined, onChange?: () => void) {
    const collision = new Collision(onChange);

    if (descriptor) {
      collision.enabled = descriptor.enabled ?? false;
      collision.bounce = descriptor.bounce ?? 1;
      collision.dampen = descriptor.dampen ?? 0;
    }

    return collision;
  }

  applyOverrides(descriptor?: CollisionDescriptor) {
    this._enabled.applyOverride(descriptor?.enabled)
    this._bounce.applyOverride(descriptor?.bounce)
    this._dampen.applyOverride(descriptor?.dampen)
  }

  toDescriptor(overridesOnly = false): CollisionDescriptor | undefined {
    const descriptor = {
      enabled: this._enabled.toDescriptor(overridesOnly),
      bounce: this._bounce.toDescriptor(overridesOnly),
      dampen: this._dampen.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }

  protected setOnChange(onChange: () => void) {
    super.setOnChange(onChange)

    if (this._bounce !== undefined) {
      this._bounce.onChange = onChange;
    }

    if (this._dampen !== undefined) {
      this._dampen.onChange = onChange;
    }
  }
}

export default Collision;
