import { runInAction } from 'mobx';
import { Property } from './Property';
import type PSValue from './PSValue';
import type PropsBase from './PropsBase';

type BurstsType = { time: number, count: PSValue, cycles: number, probability: number }[];

export class PSBursts extends Property<BurstsType> {
  constructor(
    props: PropsBase,
    value?: BurstsType,
    defaultValue = [],
    onChange?: () => void,
  ) {
    super(props, value, defaultValue, onChange)
  }

  copyProp(other: Property<BurstsType>) {
    runInAction(() => {
      this.value = [...(other as PSBursts).value];
      this.override = false;
    })
  }

  toDescriptor(): any | undefined {
    // Only output the descriptor if this a base property or if this is an override
    if (this.props.isTopLevel || this.override) {
      return this.value.map((v) => ({
        time: v.time,
        count: v.count.toDescriptor(),
        cycles: v.cycles,
        probability: v.probability,
      }))
    }
  }
}
