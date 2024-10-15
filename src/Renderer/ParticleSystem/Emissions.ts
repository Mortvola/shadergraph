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

  constructor(props: PropsBase, descriptor?: EmissionsDescriptor, onChange?: () => void, previousProps?: Emissions) {
    super(props, descriptor?.enabled, true, onChange, previousProps?.enabled)

    this.rate = new PSNumber('Rate over time', props, descriptor?.rate, 2, onChange, previousProps?.rate)

    this.bursts = new PSBursts('', props, [], undefined, onChange, previousProps?.bursts)

    this.bursts.set(
      descriptor?.bursts
        ? descriptor.bursts.map((burst) => ({
            time: burst.time,
            count: new PSValue('', props, burst.count, undefined, onChange),
            cycles: burst.cycles,
            probability: burst.probability,
          }))
        : [],
      descriptor?.bursts !== undefined
    )
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
