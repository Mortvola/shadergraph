import PSModule from '../Properties/PSModule';
import type { CollisionDescriptor } from './Types';
import { removeUndefinedKeys } from '../Properties/Types';
import { PSNumber } from '../Properties/Property';

class Collision extends PSModule {
  bounce: PSNumber

  dampen: PSNumber;

  constructor(descriptor?: CollisionDescriptor, onChange?: () => void) {
    super(descriptor?.enabled, undefined, onChange);

    this.bounce = new PSNumber(descriptor?.bounce, 1, onChange);
    this.dampen = new PSNumber(descriptor?.dampen, 0, onChange);
  }

  update(_descriptor?: CollisionDescriptor) {

  }

  toDescriptor(overridesOnly: boolean): CollisionDescriptor | undefined {
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
