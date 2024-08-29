import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import { CollisionDescriptor, PSNumber } from "./Types";

class Collision extends PSModule {
  bounce: PSNumber;

  dampen: PSNumber;

  constructor(onChange?: () => void) {
    super(onChange);

    this.bounce = new PSNumber(1, onChange);
    this.dampen = new PSNumber(0, onChange);
  
    makeObservable(this, {
      bounce: observable,
      dampen: observable,
    })
  }

  static fromDescriptor(descriptor: CollisionDescriptor | undefined, onChange?: () => void) {
    const collision = new Collision(onChange);

    if (descriptor) {
      collision.enabled = descriptor.enabled;
      collision.bounce.value = descriptor.bounce;
      collision.dampen.value = descriptor.dampen;
    }

    return collision;
  }

  toDescriptor(): CollisionDescriptor {
    return ({
      enabled: this.enabled,
      bounce: this.bounce.value,
      dampen: this.dampen.value,
    })
  }

  protected setOnChange(onChange: () => void) {
    super.setOnChange(onChange)

    if (this.bounce !== undefined) {
      this.bounce.onChange = onChange;
    }

    if (this.dampen !== undefined) {
      this.dampen.onChange = onChange;
    }
  }
}

export default Collision;
