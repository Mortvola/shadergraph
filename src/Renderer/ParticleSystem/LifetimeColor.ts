import { makeObservable, observable } from "mobx";
import type { LifetimeColorDescriptor } from "./Types";
import PSColor from "../Properties/PSColor";
import PSModule from "./PSModule";
import type { PropsBase} from "../Properties/Types";
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

  getOverrides() {
    return [
      this.color.getOverrides(),
    ]
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
