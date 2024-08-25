import { makeObservable, observable, runInAction } from "mobx";
import { lerp } from "../Math";
import { PSValueDescriptor, PSValueType } from "./Types";
import PSCurve from "./PSCurve";

class PSValue {
  type = PSValueType.Constant;

  value: [number, number] = [1, 1];

  curve: [PSCurve, PSCurve];

  curveRange: [number, number] = [0, 1];

  onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange;

    this.curve = [new PSCurve(onChange), new PSCurve(onChange)]

    makeObservable(this, {
      type: observable,
      value: observable,
      curve: observable,
      curveRange: observable,
    })
  }

  static fromDescriptor(descriptor?: PSValueDescriptor, onChange?: () => void) {
    const psValue = new PSValue(onChange)

    if (descriptor) {
      psValue.type = descriptor.type ?? PSValueType.Constant;
      psValue.value = descriptor.value !== undefined
        ? [descriptor.value[0], descriptor.value[1]]
        : [1, 1];
      psValue.curve = [
        PSCurve.fromDescriptor((descriptor?.curve && descriptor?.curve.length > 0) ? descriptor.curve![0] : undefined, onChange),
        PSCurve.fromDescriptor((descriptor?.curve && descriptor?.curve.length > 1) ? descriptor.curve![1] : undefined, onChange),
      ];
      psValue.curveRange = [
        descriptor.curveRange ? descriptor.curveRange[0] : 0,
        descriptor.curveRange ? descriptor.curveRange[1] : 1,
      ]
    }

    return psValue;
  }

  toDescriptor(): PSValueDescriptor {
    return ({
      type: this.type,
      value: this.value,
      curve: this.curve,
      curveRange: this.curveRange,
    })
  }

  setType(type: PSValueType) {
    runInAction(() => {
      this.type = type;

      if (this.onChange) {
        this.onChange();
      }
    })
  }

  setMinValue(min: number) {
    runInAction(() => {
      this.value = [min, this.value[1]]

      if (this.onChange) {
        this.onChange();
      }
    })
  }

  setMaxValue(max: number) {
    runInAction(() => {
      this.value = [this.value[0], max]

      if (this.onChange) {
        this.onChange();
      }
    })
  }

  setCurveRange(range: [number, number]) {
    runInAction(() => {
      this.curveRange = range;

      if (this.onChange) {
        this.onChange();
      }
    })
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
