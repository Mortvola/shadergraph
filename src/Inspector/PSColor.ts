import { makeObservable, observable, runInAction } from "mobx";
import { lerp } from "../Renderer/Math";
import { PSColorDescriptor, PSColorType } from "../Renderer/types";
import Gradient from "./Gradient";

export const isPSColor = (r: unknown): r is PSColor => (
  (r as PSColorDescriptor).type !== undefined
  && (r as PSColorDescriptor).color !== undefined
);

class PSColor {
  type = PSColorType.Constant;

  color: [number[], number[]] = [[1, 1, 1, 1], [1, 1, 1, 1]];

  gradients: [Gradient, Gradient];

  onChange?: () => void;

  constructor(onChange?: () => void) {
    this.gradients = [new Gradient(), new Gradient()]
    this.onChange = onChange;

    makeObservable(this, {
      type: observable,
      color: observable,
    })
  }

  static fromDescriptor(descriptor: PSColorDescriptor | undefined, onChange?: () => void) {
    const psColor = new PSColor(onChange);

    if (descriptor && isPSColor(descriptor)) {
      psColor.type = descriptor.type;
      psColor.color = [[...descriptor.color[0]], [...descriptor.color[1]]]
      psColor.gradients = [
        Gradient.fromDescriptor(descriptor.gradients[0], psColor.onChange),
        Gradient.fromDescriptor(descriptor.gradients[1], psColor.onChange),
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

  setType(type: PSColorType) {
    runInAction(() => {
      this.type = type;

      if (this.onChange) {
        this.onChange()
      }
    })
  }

  setMinColor(color: number[]) {
    runInAction(() => {
      this.color = [
        color,
        this.color[1],
      ]

      if (this.onChange) {
        this.onChange()
      }
    })
  }

  setMaxColor(color: number[]) {
    runInAction(() => {
      this.color = [
        this.color[0],
        color,
      ]

      if (this.onChange) {
        this.onChange()
      }
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

