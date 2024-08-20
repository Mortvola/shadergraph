import { makeObservable, observable, runInAction } from "mobx";
import PSModule from "./PSModule";
import { CollisionDescriptor } from "./Types";

class Collision extends PSModule {
  bounce = 1;

  dampen = 0;

  constructor(onChange?: () => void) {
    super(onChange);

    makeObservable(this, {
      bounce: observable,
      dampen: observable,
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

  setBounce(value: number) {
    runInAction(() => {
      this.bounce = value;
      
      if (this.onChange) {
        this.onChange();
      }
    })
  }

  setDampen(value: number) {
    runInAction(() => {
      this.dampen = value;

      if (this.onChange) {
        this.onChange();
      }
    })
  }
}

export default Collision;
