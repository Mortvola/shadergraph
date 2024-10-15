import { makeObservable, observable } from "mobx";
import type { LifetimeColorDescriptor } from "./Types";
import PSColor from "../Properties/PSColor";
import PSModule from "../Properties/PSModule";
import type PropsBase from "../Properties/PropsBase";
import { removeUndefinedKeys } from "../Properties/Types";

class LifetimeColor extends PSModule {
  color: PSColor;

  constructor(props: PropsBase, descriptor?: LifetimeColorDescriptor, onChange?: () => void, previousProps?: LifetimeColor) {
    super(props, descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.color = new PSColor('Color', props, descriptor?.color, onChange, previousProps?.color);

    makeObservable(this, {
      color: observable,
    })
  }

  toDescriptor(): LifetimeColorDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(),
      color: this.color.toDescriptor(),
    };

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeColor;
