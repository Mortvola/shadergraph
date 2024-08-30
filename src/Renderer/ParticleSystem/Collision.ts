import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import { CollisionDescriptor } from "./Types";
import { PSNumber } from "../Properties/Types";

class Collision extends PSModule {
  _bounce: PSNumber;

  get bounce(): number {
    return this._bounce.value
  }

  set bounce(newValue: number) {
    this._bounce.value = newValue
  }

  _dampen: PSNumber;

  get dampen(): number {
    return this._dampen.value
  }

  set dampen(newValue: number) {
    this._dampen.value = newValue
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

  static fromDescriptor(descriptor: CollisionDescriptor | undefined, onChange?: () => void) {
    const collision = new Collision(onChange);

    if (descriptor) {
      collision.enabled = descriptor.enabled;
      collision.bounce = descriptor.bounce;
      collision.dampen = descriptor.dampen;
    }

    return collision;
  }

  toDescriptor(): CollisionDescriptor {
    return ({
      enabled: this.enabled,
      bounce: this.bounce,
      dampen: this.dampen,
    })
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
