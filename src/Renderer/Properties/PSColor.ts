import { observable, runInAction } from "mobx";
import { lerp } from "../Math";
import { PSColorDescriptor, PSColorType } from "../ParticleSystem/Types";
import Gradient from '../ParticleSystem/Gradient';
import { PropertyType } from "./Types";
import { Property2Base } from "./Property2";

type ColorPair = [number[], number[]];

type ValueType = {
  type: PSColorType,
  color: ColorPair,
  gradients: [Gradient, Gradient]
}

class PSColor extends Property2Base {
  @observable
  accessor _type = PSColorType.Constant;

  get type(): PSColorType {
    return this._type
  }

  set type(newValue: PSColorType) {
    runInAction(() => {
      this._type = newValue;
    })
  }

  @observable
  accessor _color: ColorPair = [[1, 1, 1, 1], [1, 1, 1, 1]];

  get color(): ColorPair {
    return this._color;
  }

  set color(value: PropertyType<ColorPair>) {
    runInAction(() => {
      this._color = value.value;
      this.override = value.override ?? this.override;
    })
  }

  gradients: [Gradient, Gradient];

  value: ValueType;

  set(value: Partial<ValueType>, override?: boolean) {
    this.value = {
      ...this.value,
      ...value,
    }
  }

  constructor(descriptor?: PSColorDescriptor, onChange?: () => void, prevousProp?: PSColor) {
    super();

    this.gradients = [new Gradient(onChange, this.onOverride), new Gradient(onChange, this.onOverride)]

    if (descriptor) {
      this.applyDescriptor(descriptor)
    }  

    if (prevousProp) {
      if (descriptor === undefined) {
        this.copyProp(prevousProp)
      }
      else {
        this.override = true
      }  
    }

    this.value = {
      type: this._type,
      color: this.color,
      gradients: this.gradients,
    }

    this.onChange = onChange;

    this.reactOnChange(() => this.value);
    this.reactOnChange(() => this._type);
    this.reactOnChange(() => this._color);
    this.reactOnChange(() => this.gradients);
  }

  onOverride = (override?: boolean) => {
    runInAction(() => {
      if (override !== undefined) {
        this.override = override;
      }  
    })
  }

  copyProp(other: PSColor, noOverrides = true) {
    if (!this.override || !noOverrides) {
      runInAction(() => {
        this._type = other._type;
        this._color = [
          [...other._color[0]],
          [...other._color[1]],
        ];  
      })
      this.gradients[0].copy(other.gradients[0]);
      this.gradients[1].copy(other.gradients[1]);
    }
  }

  applyDescriptor(descriptor: PSColorDescriptor) {
    this.type = descriptor.type ?? PSColorType.Constant;
    this.color = descriptor.color !== undefined
      ? { value: [[...descriptor.color[0]], [...descriptor.color[1]]] }
      : { value: [[1, 1, 1, 1], [1, 1, 1, 1]] };
    this.gradients = descriptor.gradients !== undefined
      ? [
        Gradient.fromDescriptor(descriptor.gradients[0], this.onChange, this.onOverride),
        Gradient.fromDescriptor(descriptor.gradients[1], this.onChange, this.onOverride),
      ]
      : [
        new Gradient(this.onChange, this.onOverride),
        new Gradient(this.onChange, this.onOverride),
      ];
  }

  toDescriptor(overridesOnly = false): PSColorDescriptor | undefined {
    if (!overridesOnly || this.override) {
      return ({
        type: this.type,
        color: [this.color[0].slice(), this.color[1].slice()],
        gradients: [this.gradients[0].toDescriptor(), this.gradients[1].toDescriptor()],
      })  
    }
  }

  getColor(t: number): number[] {
    switch (this.type) {
      case PSColorType.Constant:
        return this.color[0];
      
      case PSColorType.Random: {
        const r = Math.random();
  
        return lerp(this.color[0], this.color[1], r)
      }
  
      case PSColorType.Gradient:
        return this.gradients[0].getColor(t);
  
      case PSColorType.RandomeGradient:
        const color1 = this.gradients[0].getColor(t);
        const color2 = this.gradients[1].getColor(t);
  
        const r = Math.random();
  
        return lerp(color1, color2, r)
    }
  }
}

export default PSColor;

