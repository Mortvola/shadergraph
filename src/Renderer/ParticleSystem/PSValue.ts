import { makeObservable, observable, runInAction } from "mobx";
import { lerp } from "../Math";
import { PSValueDescriptor, PSValueType } from "./Types";
import PSCurve from "./PSCurve";
import { Property } from "../Properties/Types";

class PSValue extends Property {
  // Methods for type
  @observable
  _type = PSValueType.Constant;

  get type(): PSValueType {
    return this._type
  }

  set type(newValue: PSValueType) {
    runInAction(() => {
      this._type = newValue;
    })
  }

  // Methods for value
  @observable
  _value: [number, number] = [1, 1];

  get value(): [number, number] {
    return this._value;
  }

  set value(newValue: [number,  number]) {
    runInAction(() => {
      this._value = newValue;
    })
  }

  // Methods for curve
  @observable
  curve: [PSCurve, PSCurve];

  // Methods for curve range
  @observable
  _curveRange: [number, number] = [0, 1];

  get curveRange(): [number, number] {
    return this._curveRange;
  }

  set curveRange(newValue: [number,  number]) {
    runInAction(() => {
      this._curveRange = newValue;
    })
  }

  constructor(onChange?: () => void) {
    super()
    
    this.onChange = onChange;

    this.curve = [new PSCurve(onChange), new PSCurve(onChange)]

    this.reactOnChange(() => this._type)
    this.reactOnChange(() => this._value)
    this.reactOnChange(() => this._curveRange)
  }

  copyValues(other: PSValue, noOverrides = true) {
    if (!this.override || !noOverrides) {
      runInAction(() => {
        this._type = other._type;
        this._value = [...other._value];
        this._curveRange = [...other._curveRange];  
      })
      this.curve[0].copy(other.curve[0]);
      this.curve[1].copy(other.curve[1]);
    }
  }

  static fromDescriptor(descriptor?: PSValueDescriptor, onChange?: () => void) {
    const psValue = new PSValue(onChange)

    if (descriptor) {
      psValue.applyDescriptor(descriptor)
    }

    return psValue;
  }

  applyOverrides(descriptor?: PSValueDescriptor) {
    if (descriptor) {
      this.applyDescriptor(descriptor);
      this.override = true;
    }
  }

  applyDescriptor(descriptor: PSValueDescriptor) {
    this.type = descriptor.type ?? PSValueType.Constant;
    this.value = descriptor.value !== undefined
      ? [descriptor.value[0], descriptor.value[1]]
      : [1, 1];
    this.curve = [
      PSCurve.fromDescriptor((descriptor?.curve && descriptor?.curve.length > 0) ? descriptor.curve![0] : undefined, this.onChange),
      PSCurve.fromDescriptor((descriptor?.curve && descriptor?.curve.length > 1) ? descriptor.curve![1] : undefined, this.onChange),
    ];
    this.curveRange = [
      descriptor.curveRange ? descriptor.curveRange[0] : 0,
      descriptor.curveRange ? descriptor.curveRange[1] : 1,
    ]
  }

  toDescriptor(overridesOnly = false): PSValueDescriptor | undefined {
    if (!overridesOnly || this.override) {
      return ({
        type: this.type,
        value: this.value,
        curve: this.curve,
        curveRange: this.curveRange,
      })  
    }
  }

  getValue(t: number) {
    switch (this.type) {
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
