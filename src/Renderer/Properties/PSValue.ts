import { observable, runInAction } from 'mobx';
import { lerp } from '../Math';
import type { PSValueDescriptor} from '../ParticleSystem/Types';
import { PSValueType } from '../ParticleSystem/Types';
import PSCurve from './PSCurve';
import type { PropertyType } from './Types';
import type PropsBase from './PropsBase';
import PropertyBase from './PropertyBase';

class PSValue extends PropertyBase {
  // Methods for type
  @observable
  private accessor _type = PSValueType.Constant;

  get valueType(): PSValueType {
    return this._type
  }

  set valueType(value: PropertyType<PSValueType>) {
    runInAction(() => {
      this._type = value.value;
      if (value.override) {
        this.override = value.override && !this.props.isTopLevel
      }
    })
  }

  // Methods for value
  @observable
  private accessor _value: [number, number] = [1, 1];

  get value(): [number, number] {
    return this._value;
  }

  set value(value: PropertyType<[number,  number]>) {
    runInAction(() => {
      this._value = value.value;
      if (value.override !== undefined) {
        this.override = value.override && !this.props.isTopLevel
      }
    })
  }

  // Methods for curve
  @observable
  accessor curve: [PSCurve, PSCurve];

  // Methods for curve range
  @observable
  private accessor _curveRange: [number, number] = [0, 1];

  get curveRange(): [number, number] {
    return this._curveRange;
  }

  set curveRange(value: PropertyType<[number,  number]>) {
    runInAction(() => {
      this._curveRange = value.value;
      if (value.override !== undefined) {
        this.override = value.override && !this.props.isTopLevel
      }
    })
  }

  constructor(
    props: PropsBase,
    descriptor?: PSValueDescriptor,
    defaultDescriptor?: PSValueDescriptor,
    onChange?: () => void,
  ) {
    super(props)

    this.curve = [new PSCurve(this), new PSCurve(this)]

    const d = descriptor ?? defaultDescriptor;
    if (d) {
      this.applyDescriptor(d)
    }

    this.onChange = onChange;

    this.reactOnChange(() => ({
      override: this.override,
      type: this._type,
      value: this._value,
      curveRange: this._curveRange,
      curve: [
        { points: this.curve[0].points },
        { points: this.curve[1].points },
      ],
    }))
  }

  update(descriptor?: PSValueDescriptor) {
    if (descriptor) {
      this.applyDescriptor(descriptor)
    }
  }

  toString(): string {
    switch (this.valueType) {
      case PSValueType.Constant:
        return this.value[0].toString()

      case PSValueType.Random:
        return `${this.value[0].toString()} - ${this.value[1].toString()}`

      case PSValueType.Curve:
        return 'Curve'

      case PSValueType.RandomeCurve:
        return 'Random Curve'
    }
  }

  copyProp(other: PSValue) {
    runInAction(() => {
      this._type = other._type;
      this._value = [...other._value];
      this._curveRange = [...other._curveRange];
      this.curve[0].copy(other.curve[0]);
      this.curve[1].copy(other.curve[1]);

      this.override = false;
    })
  }

  applyDescriptor(descriptor: PSValueDescriptor) {
    this.valueType = { value: descriptor.type ?? PSValueType.Constant };
    this.value = { value: (descriptor.value !== undefined
      ? [descriptor.value[0], descriptor.value[1]]
      : [1, 1]) };
    this.curve = [
      PSCurve.fromDescriptor(
        (descriptor?.curve && descriptor?.curve.length > 0) ? descriptor.curve![0] : undefined,
        this,
      ),
      PSCurve.fromDescriptor(
        (descriptor?.curve && descriptor?.curve.length > 1) ? descriptor.curve![1] : undefined,
        this,
      ),
    ];
    this.curveRange = { value: [
      descriptor.curveRange ? descriptor.curveRange[0] : 0,
      descriptor.curveRange ? descriptor.curveRange[1] : 1,
    ]}
  }

  toDescriptor(): PSValueDescriptor | undefined {
    if (this.props.isTopLevel || this.override) {
      return ({
        type: this.valueType,
        value: this.value,
        curve: [this.curve[0].toDescriptor(), this.curve[0].toDescriptor()],
        curveRange: this.curveRange,
      })
    }
  }

  getValue(t: number) {
    switch (this.valueType) {
      case PSValueType.Constant:
        return this.value[0];

      case PSValueType.Random:
        return lerp(this.value[0], this.value[1], Math.random());

      case PSValueType.Curve: {
        const v = this.curve[0].getValue(t) ?? 1;
        return lerp(this.curveRange[0], this.curveRange[1], v);
      }
    }

    return 1;
  }
}

export default PSValue;
