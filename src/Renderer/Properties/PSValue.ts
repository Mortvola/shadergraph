import { observable, runInAction } from "mobx";
import { lerp } from "../Math";
import type { PSValueDescriptor} from "../ParticleSystem/Types";
import { PSValueType } from "../ParticleSystem/Types";
import PSCurve from "./PSCurve";
import type { PropertyType, PropsBase } from "./Types";
import PropertyBase from "./PropertyBase";

class PSValue extends PropertyBase {
  // Methods for type
  @observable
  private accessor _type = PSValueType.Constant;

  get style(): PSValueType {
    return this._type
  }

  set style(value: PropertyType<PSValueType>) {
    runInAction(() => {
      this._type = value.value;
      if (value.override) {
        this.override = value.override && this.base !== undefined
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
        this.override = value.override && this.base !== undefined
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
        this.override = value.override && this.base !== undefined
      }
    })
  }

  constructor(
    name: string,
    props: PropsBase,
    descriptor?: PSValueDescriptor,
    defaultDescriptor?: PSValueDescriptor,
    onChange?: () => void,
    previousProp?: PSValue,
  ) {
    super(name, props, previousProp)
    
    this.curve = [new PSCurve(this), new PSCurve(this)]

    const d = descriptor ?? defaultDescriptor;
    if (d) {
      this.applyDescriptor(d)
    }  

    // If there is a previous prop but the initial value
    // for this property is undefined then copy the value 
    // from the previous prop. Otherwise, mark this property
    // as an override of the previous prop.
    if (previousProp) {
      if (descriptor === undefined) {
        this.copyProp(previousProp)
      }
      else {
        this.override = true;
      }  
    }

    this.onChange = onChange;

    this.reactOnChange(() => ({
      override: this.override,
      type: this._type,
      value: this._value,
      curveRange: this._curveRange,
      curve: [
        { points: this.curve[0].points },
        { points: this.curve[1].points }
      ]
    }))
  }

  toString(): string {
    switch (this.style) {
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
    this.style = { value: descriptor.type ?? PSValueType.Constant };
    this.value = { value: (descriptor.value !== undefined
      ? [descriptor.value[0], descriptor.value[1]]
      : [1, 1]) };
    this.curve = [
      PSCurve.fromDescriptor((descriptor?.curve && descriptor?.curve.length > 0) ? descriptor.curve![0] : undefined, this),
      PSCurve.fromDescriptor((descriptor?.curve && descriptor?.curve.length > 1) ? descriptor.curve![1] : undefined, this),
    ];
    this.curveRange = { value: [
      descriptor.curveRange ? descriptor.curveRange[0] : 0,
      descriptor.curveRange ? descriptor.curveRange[1] : 1,
    ]}
  }

  toDescriptor(): PSValueDescriptor | undefined {
    if (this.base === undefined || this.override) {
      return ({
        type: this.style,
        value: this.value,
        curve: [this.curve[0].toDescriptor(), this.curve[0].toDescriptor()],
        curveRange: this.curveRange,
      })  
    }
  }

  getValue(t: number) {
    switch (this.style) {
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
