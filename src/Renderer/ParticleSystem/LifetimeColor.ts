import { makeAutoObservable, observable, runInAction } from "mobx";
import { LifetimeColorDescriptor } from "./Types";
import PSColor from "./PSColor";

class LifetimeColor {
  enabled = false;

  color = new PSColor();

  onChange?: () => void;

  constructor() {
    makeAutoObservable(this, {
      enabled: observable,
      color: observable,
    })
  }

  static fromDescriptor(descriptor: LifetimeColorDescriptor | undefined, onChange?: () => void) {
    const lifetimeColor = new LifetimeColor();
    lifetimeColor.onChange = onChange;

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

  setEnabled(enabled: boolean) {
    runInAction(() => {
      this.enabled = enabled;

      if (this.onChange) {
        this.onChange();
      }
    })
  }
}

export default LifetimeColor;
