import { PSNumber } from '../Properties/Property';
import { removeUndefinedKeys } from '../Properties/Types';
import type PropsBase from '../Properties/PropsBase';
import PSModule from '../Properties/PSModule';
import { type EmissionsDescriptor } from './Types';
import { PSBursts } from '../Properties/PSBursts';
import PSValue from '../Properties/PSValue';
import { runInAction } from 'mobx';

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

  addBurst() {
    runInAction(() => {
      this.bursts.set(
        [
          ...this.bursts.get(),
          { time: 0, count: new PSValue(this.rate.props, { value: [1, 1] }), cycles: 0, probability: 1 },
        ],
        true,
      )
    })
  }

  deleteBurst(index: number) {
    runInAction(() => {
      this.bursts.set(
        [
          ...this.bursts.get().slice(0, index),
          ...this.bursts.get().slice(index + 1),
        ],
        true,
      )
    })
  }

  updateBurstTime(index: number, value: number) {
    runInAction(() => {
      this.bursts.set(
        [
          ...this.bursts.get().slice(0, index),
          { ...this.bursts.get()[index], time: value },
          ...this.bursts.get().slice(index + 1),
        ],
        true,
      )
    })
  }

  toDescriptor(overridesOnly: boolean): EmissionsDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      rate: this.rate.toDescriptor(overridesOnly),
      bursts: this.bursts.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default Emissions;
