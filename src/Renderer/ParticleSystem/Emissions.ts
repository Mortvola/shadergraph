import { PSNumber } from '../Properties/Property';
import { removeUndefinedKeys } from '../Properties/Types';
import type PropsBase from '../Properties/PropsBase';
import PSModule from '../Properties/PSModule';
import { type EmissionsDescriptor } from './Types';
import { PSBursts } from '../Properties/PSBursts';
import PSValue from '../Properties/PSValue';

class Emissions extends PSModule {
  rate: PSNumber

  bursts: PSBursts

  constructor(props: PropsBase, descriptor?: EmissionsDescriptor, onChange?: () => void) {
    super(props, descriptor?.enabled, true, onChange)

    this.rate = new PSNumber(props, descriptor?.rate, 2, this.onChange)

    const bursts = descriptor?.bursts
      ? descriptor.bursts.map((burst) => ({
          time: burst.time,
          count: new PSValue(props, burst.count, undefined, this.onChange),
          cycles: burst.cycles,
          probability: burst.probability,
        }))
      : []

    this.bursts = new PSBursts(props, bursts, undefined, this.onChange)
  }

  update(descriptor?: EmissionsDescriptor) {
    if (descriptor) {
      this.rate.set(descriptor.rate)

      this.bursts.set(
        (descriptor.bursts ?? []).map((burst) => ({
          time: burst.time,
          count: new PSValue(this.props, burst.count, undefined, this.onChange),
          cycles: burst.cycles,
          probability: burst.probability,
        })),
      )
    }
  }

  toDescriptor(): EmissionsDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(),
      rate: this.rate.toDescriptor(),
      bursts: this.bursts.toDescriptor(),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default Emissions;
