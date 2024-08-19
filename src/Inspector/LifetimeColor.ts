import { makeAutoObservable, observable } from "mobx";
import { LifetimeColorDescriptor } from "../Renderer/types";
import PSColor from "./PSColor";

class LifetimeColor {
  enabled = false;

  color = new PSColor();

  constructor() {
    makeAutoObservable(this, {
      enabled: observable,
      color: observable,
    })
  }

  static fromDescriptor(descriptor: LifetimeColorDescriptor | undefined) {
    const lifetimeColor = new LifetimeColor();

    if (descriptor) {
      lifetimeColor.enabled = descriptor.enabled;
      lifetimeColor.color = PSColor.fromDescriptor(descriptor.color);  
    }

    return lifetimeColor;
  }
}

export default LifetimeColor;
