import { Interval } from 'luxon';
import { type BurstDescriptor } from '../ParticleSystem/Types';
import { Property } from './Property';
import type PSValue from './PSValue';

type BurstsType = {
  key: string,
  time: number,
  count: PSValue,
  cycles: number,
  interval: number,
  probability: number,
}[];

export class PSBursts extends Property<BurstsType, BurstDescriptor[]> {
  constructor(
    value?: BurstsType,
    defaultValue = [],
    onChange?: () => void,
  ) {
    super(value, defaultValue, onChange)
  }

  toDescriptor(overridesOnly: boolean): BurstDescriptor[] | undefined {
    // Only output the descriptor if this a base property or if this is an override
    if (!overridesOnly || this.override) {
      const bursts = this.value.map((v) => ({
        time: v.time,
        count: v.count.toDescriptor(false),
        cycles: v.cycles,
        interval: v.interval,
        probability: v.probability,
      }))

      return bursts
    }
  }
}
