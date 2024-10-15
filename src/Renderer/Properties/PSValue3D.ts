import { observable, runInAction } from "mobx";
import { lerp } from "../Math";
import { PSValueType, type PSValueDescriptor, type PSValue3DDescriptor } from "../ParticleSystem/Types";
import PropertyBase from "./PropertyBase";
import PSCurve from "./PSCurve";
import PSValue2 from "./PSValue2"
import { type PropertyType } from "./Types";
import type PropsBase from "./PropsBase";

class PSValue3D extends PropertyBase {
  @observable
  private accessor _separateAxes = false

  set separateAxes(value: PropertyType<boolean>) {
    runInAction(() => {
      this._separateAxes = value.value;
      if (value.override !== undefined) {
        this.override = value.override && this.base !== undefined
      }  
    })
  }

  get separateAxes(): boolean {
    return this._separateAxes
  }

  values: [PSValue2, PSValue2, PSValue2]

  @observable
  private accessor _style = PSValueType.Constant

  get style(): PSValueType {
    return this._style
  }

  set style(value: PropertyType<PSValueType>) {
    runInAction(() => {
      this._style = value.value;
      if (value.override) {
        this.override = value.override && this.base !== undefined
      }  
    })
  }

  constructor(
    name: string,
    props: PropsBase,
    descriptor?: PSValue3DDescriptor,
    defaultDescriptor?: PSValue3DDescriptor,
    onChange?: () => void,
    previousProp?: PSValue3D,
  ) {
    super(name, props, previousProp)

    this.values = [new PSValue2(this), new PSValue2(this), new PSValue2(this)]

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
      separateAces: this._separateAxes,
      style: this._style,
      values: this.values.map((v) => v.observables()),
    }))
  }

  copyProp(other: PSValue3D) {
    runInAction(() => {
      this._separateAxes = other._separateAxes;
      this._style = other._style;
      this.values = [...other.values];
  
      this.override = false;  
    })
  }

  applyDescriptor(descriptor: PSValue3DDescriptor & { value?: [number, number] }) {
    this.separateAxes = { value: descriptor.separateAxes };
    this.style = { value: descriptor.type ?? PSValueType.Constant };

    if (descriptor.values !== undefined) {
      this.values = [
        this.applyValueDescriptor(descriptor.values[0]),
        this.applyValueDescriptor(descriptor.values[1]),
        this.applyValueDescriptor(descriptor.values[2]),
      ]  
    }
    else if (descriptor.value !== undefined) {
      // TODO: This is here to support older descriptors. Remove when no longer needed
      this.values[0].value = { value: [...descriptor.value] }
      this.values[1].value = { value: [...descriptor.value] }
      this.values[2].value = { value: [...descriptor.value] }
    }
  }

  applyValueDescriptor(descriptor: PSValueDescriptor): PSValue2 {
    const value = new PSValue2(this)

    value.value = { value: descriptor.value !== undefined
      ? [descriptor.value![0], descriptor.value![1]]
      : [1, 1]
    };
    value.curve = [
      PSCurve.fromDescriptor((descriptor?.curve && descriptor?.curve.length > 0) ? descriptor.curve![0] : undefined, this),
      PSCurve.fromDescriptor((descriptor?.curve && descriptor?.curve.length > 1) ? descriptor.curve![1] : undefined, this),
    ];
    value.curveRange = { value: [
      descriptor.curveRange ? descriptor.curveRange[0] : 0,
      descriptor.curveRange ? descriptor.curveRange[1] : 1,
    ]}

    return value;
  }

  toDescriptor(): PSValue3DDescriptor | undefined {
    if (this.base === undefined || this.override) {
      return ({
        separateAxes: this.separateAxes,
        type: this.style,
        values: [
          this.toValueDescriptor(this.values[0]),
          this.toValueDescriptor(this.values[1]),
          this.toValueDescriptor(this.values[2]),
        ]
      })  
    }
  }

  toValueDescriptor(value: PSValue2): PSValueDescriptor {
    return ({
      value: value.value,
      curve: [value.curve[0].toDescriptor(), value.curve[1].toDescriptor()],
      curveRange: value.curveRange,
    })
  }

  getValue(t: number): [number, number, number] {
    if (this.separateAxes) {
      return [
        this.getAxisValue(this.values[0], this.style, t),
        this.getAxisValue(this.values[1], this.style, t),
        this.getAxisValue(this.values[2], this.style, t),
      ]
    }

    const v = this.getAxisValue(this.values[0], this.style, t)

    return [v, v, v]
  }

  getAxisValue(value: PSValue2, style: PSValueType, t: number) {
    switch (style) {
      case PSValueType.Constant:
        return value.value[0];
  
      case PSValueType.Random:
        return lerp(value.value[0], value.value[1], Math.random());
  
      case PSValueType.Curve: {
        const v = value.curve[0].getValue(t) ?? 1;
        return lerp(value.curveRange[0], value.curveRange[1], v);
      }
    }
  
    return 1;
  }
}

export default PSValue3D;
