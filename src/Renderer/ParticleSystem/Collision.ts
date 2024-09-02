import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import { CollisionDescriptor } from "./Types";
import { removeUndefinedKeys } from "../Properties/Types";
import { PSNumber } from "../Properties/Property";

class Collision extends PSModule {
  bounce: PSNumber

  dampen: PSNumber;

  constructor(descriptor?: CollisionDescriptor, onChange?: () => void, previousProps?: Collision) {
    super(descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.bounce = new PSNumber(descriptor?.bounce, 1, onChange, previousProps?.bounce);
    this.dampen = new PSNumber(descriptor?.dampen, 0, onChange, previousProps?.dampen);
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
