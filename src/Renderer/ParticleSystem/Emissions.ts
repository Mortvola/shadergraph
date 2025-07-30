import { PSNumber } from '../Properties/Property';
import { removeUndefinedKeys } from '../Properties/Types';
import PSModule from '../Properties/PSModule';
import { type EmissionsDescriptor } from './Types';
import { PSBursts } from '../Properties/PSBursts';
import PSValue from '../Properties/PSValue';
import { runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';

class Emissions extends PSModule {
  rate: PSNumber

  bursts: PSBursts

  constructor(descriptor?: EmissionsDescriptor, onChange?: () => void) {
    super(descriptor?.enabled, true, onChange)

    this.rate = new PSNumber(descriptor?.rate, 2, this.onChange)

    const bursts = descriptor?.bursts
      ? descriptor.bursts.map((burst) => ({
          key: uuidv4(),
          time: burst.time,
          count: new PSValue(burst.count, undefined, this.onChange),
          cycles: burst.cycles,
          interval: burst.interval ?? 1,
          probability: burst.probability,
        }))
      : []

    this.bursts = new PSBursts(bursts, undefined, this.onChange)
  }

  update(descriptor?: EmissionsDescriptor) {
    if (descriptor) {
      this.rate.set(descriptor.rate)

      this.bursts.set(
        (descriptor.bursts ?? []).map((burst) => ({
          key: uuidv4(),
          time: burst.time,
          count: new PSValue(burst.count, undefined, this.onChange),
          cycles: burst.cycles,
          interval: burst.interval ?? 1,
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
          {
            key: uuidv4(),
            time: 0,
            count: new PSValue({ value: [1, 1] }),
            cycles: 1,
            interval: 1,
            probability: 1,
          },
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

  updateCycles(index: number, value: number) {
    runInAction(() => {
      this.bursts.set(
        [
          ...this.bursts.get().slice(0, index),
          { ...this.bursts.get()[index], cycles: value },
          ...this.bursts.get().slice(index + 1),
        ],
        true,
      )
    })
  }

  updateIntervalTime(index: number, value: number) {
    runInAction(() => {
      this.bursts.set(
        [
          ...this.bursts.get().slice(0, index),
          { ...this.bursts.get()[index], interval: value },
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
