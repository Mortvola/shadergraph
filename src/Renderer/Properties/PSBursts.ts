import { Property } from './Property';
import type PSValue from './PSValue';

type BurstsType = { time: number, count: PSValue, cycles: number, probability: number }[];

export class PSBursts extends Property<BurstsType> {
  constructor(
    value?: BurstsType,
    defaultValue = [],
    onChange?: () => void,
  ) {
    super(value, defaultValue, onChange)
  }

  toDescriptor(overridesOnly: boolean): any[] | undefined {
    // Only output the descriptor if this a base property or if this is an override
    if (!overridesOnly || this.override) {
      return this.value.map((v) => ({
        time: v.time,
        count: v.count.toDescriptor(overridesOnly),
        cycles: v.cycles,
        probability: v.probability,
      }))
    }
  }
}
