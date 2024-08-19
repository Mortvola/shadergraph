import { makeObservable, observable } from "mobx";
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

  constructor() {
    this.gradients = [new Gradient(), new Gradient()]

    makeObservable(this, {
      type: observable,
      color: observable,
    })
  }

  static fromDescriptor(descriptor: PSColorDescriptor | undefined) {
    const psColor = new PSColor();

    if (descriptor && isPSColor(descriptor)) {
      psColor.type = descriptor.type;
      psColor.color = [[...descriptor.color[0]], [...descriptor.color[1]]]
      psColor.gradients = [
        Gradient.fromDescriptor(descriptor.gradients[0]),
        Gradient.fromDescriptor(descriptor.gradients[1]),
      ];
    }

    return psColor;
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

