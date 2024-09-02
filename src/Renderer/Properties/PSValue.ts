import { observable, runInAction } from "mobx";
import { lerp } from "../Math";
import { PSValueDescriptor, PSValueType } from "../ParticleSystem/Types";
import PSCurve from "./PSCurve";
import { PropertyType } from "./Types";
import { PropertyBase } from "./Property";

class PSValue extends PropertyBase {
  // Methods for type
  @observable
  accessor _type = PSValueType.Constant;

  get type(): PSValueType {
    return this._type
  }

  set type(value: PropertyType<PSValueType>) {
    runInAction(() => {
      this._type = value.value;
      if (value.override) {
        this.override = value.override
      }
    })
  }

  // Methods for value
  @observable
  accessor _value: [number, number] = [1, 1];

  get value(): [number, number] {
    return this._value;
  }

  set value(value: PropertyType<[number,  number]>) {
    runInAction(() => {
      this._value = value.value;
      if (value.override) {
        this.override = value.override
      }
    })
  }

  // Methods for curve
  @observable
  accessor curve: [PSCurve, PSCurve];

  // Methods for curve range
  @observable
  accessor _curveRange: [number, number] = [0, 1];

  get curveRange(): [number, number] {
    return this._curveRange;
  }

  set curveRange(newValue: [number,  number]) {
    runInAction(() => {
      this._curveRange = newValue;
    })
  }

  constructor(
    descriptor?: PSValueDescriptor,
    defaultDescriptor?: PSValueDescriptor,
    onChange?: () => void,
    previousProp?: PSValue,
  ) {
    super()
    
    this.curve = [new PSCurve(onChange), new PSCurve(onChange)]

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

    this.reactOnChange(() => this._type)
    this.reactOnChange(() => this._value)
    this.reactOnChange(() => this._curveRange)
  }

  copyProp(other: PSValue, noOverrides = true) {
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

  applyDescriptor(descriptor: PSValueDescriptor) {
    this.type = { value: descriptor.type ?? PSValueType.Constant };
    this.value = { value: (descriptor.value !== undefined
      ? [descriptor.value[0], descriptor.value[1]]
      : [1, 1]) };
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
