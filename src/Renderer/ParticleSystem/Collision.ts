import PSModule from '../Properties/PSModule';
import type { CollisionDescriptor } from './Types';
import type PropsBase from '../Properties/PropsBase';
import { removeUndefinedKeys } from '../Properties/Types';
import { PSNumber } from '../Properties/Property';

class Collision extends PSModule {
  bounce: PSNumber

  dampen: PSNumber;

  constructor(props: PropsBase, descriptor?: CollisionDescriptor, onChange?: () => void) {
    super(props, descriptor?.enabled, undefined, onChange);

    this.bounce = new PSNumber(props, descriptor?.bounce, 1, onChange);
    this.dampen = new PSNumber(props, descriptor?.dampen, 0, onChange);
  }

  update(descriptor?: CollisionDescriptor) {

  }

  toDescriptor(): CollisionDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(),
      bounce: this.bounce.toDescriptor(),
      dampen: this.dampen.toDescriptor(),
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
