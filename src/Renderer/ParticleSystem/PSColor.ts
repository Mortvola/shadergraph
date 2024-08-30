import { makeObservable, observable, runInAction } from "mobx";
import { lerp } from "../Math";
import { PSColorDescriptor, PSColorType } from "./Types";
import Gradient from './Gradient';
import { Property } from "../Properties/Types";

type Color = [number[], number[]];

class PSColor extends Property {
  _type = PSColorType.Constant;

  get type(): PSColorType {
    return this._type
  }

  set type(newValue: PSColorType) {
    runInAction(() => {
      this._type = newValue;
    })
  }

  _color: [number[], number[]] = [[1, 1, 1, 1], [1, 1, 1, 1]];

  get color(): Color {
    return this._color;
  }

  set color(newValue) {
    runInAction(() => {
      this._color = newValue;
    })
  }

  gradients: [Gradient, Gradient];

  constructor(onChange?: () => void) {
    super();

    this.gradients = [new Gradient(), new Gradient()]
    this.onChange = onChange;

    makeObservable(this, {
      _type: observable,
      _color: observable,
    })

    this.reactOnChange(() => this._type);
    this.reactOnChange(() => this._color);
    this.reactOnChange(() => this.gradients);
  }

  static fromDescriptor(descriptor: PSColorDescriptor | undefined, onChange?: () => void) {
    const psColor = new PSColor(onChange);

    if (descriptor) {
      psColor.type = descriptor.type ?? PSColorType.Constant;
      psColor.color = descriptor.color !== undefined
        ? [[...descriptor.color[0]], [...descriptor.color[1]]]
        : [[1, 1, 1, 1], [1, 1, 1, 1]];
      psColor.gradients = descriptor.gradients !== undefined
        ? [
          Gradient.fromDescriptor(descriptor.gradients[0], psColor.onChange),
          Gradient.fromDescriptor(descriptor.gradients[1], psColor.onChange),
        ]
        : [
          new Gradient(onChange),
          new Gradient(onChange),
        ];
    }

    return psColor;
  }

  toDescriptor(): PSColorDescriptor {
    return ({
      type: this.type,
      color: [this.color[0].slice(), this.color[1].slice()],
      gradients: [this.gradients[0].toDescriptor(), this.gradients[1].toDescriptor()],
    })
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

