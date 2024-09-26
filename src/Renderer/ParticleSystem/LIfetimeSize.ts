import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import PSValue from "../Properties/PSValue";
import type { LifetimeSizeDescriptor } from "./Types";
import type { PropsBase} from "../Properties/Types";
import { removeUndefinedKeys } from "../Properties/Types";

class LifetimeSize extends PSModule {
  size: PSValue;

  constructor(props: PropsBase, descriptor?: LifetimeSizeDescriptor, onChange?: () => void, previousProps?: LifetimeSize) {
    super(props, descriptor?.enabled, undefined, onChange, previousProps?.enabled);

    this.size = new PSValue('Size', props, descriptor?.size, undefined, onChange, previousProps?.size);

    makeObservable(this, {
      size: observable,
    })
  }

  toDescriptor(): LifetimeSizeDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(),
      size: this.size.toDescriptor(),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default LifetimeSize;
