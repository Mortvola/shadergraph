import { makeObservable, observable } from "mobx";
import { lerp } from "../Renderer/Math";
import { AlphaGradientKey, ColorGradientKey, GradientDescriptor } from "../Renderer/types";

class Gradient {
  alphaKeys: AlphaGradientKey[] = [
    {
      id: 0,
      position: 0,
      value: 1,
    },
    {
      id: 1,
      position: 1,
      value: 1,
    }
  ];

  colorKeys: ColorGradientKey[] = [
    {
      id: 0,
      position: 0,
      value: [1, 1, 1, 1],
    },
    {
      id: 1,
      position: 1,
      value: [1, 1, 1, 1],
    }
  ]

  constructor() {
    makeObservable(this, {
      alphaKeys: observable,
      colorKeys: observable,
    })
  }
  
  static fromDescriptor(descriptor: GradientDescriptor) {
    const gradient = new Gradient();

    gradient.alphaKeys = descriptor.alphaKeys.map((k) => ({ ...k }));
    gradient.colorKeys = descriptor.colorKeys.map((k) => ({ ...k }));

    return gradient;
  }

  getColor(t: number) {
    let a = 1;
    let c = [1, 1, 1];
  
    // Find first key that is greater than or equal to t.
    let index = this.alphaKeys.findIndex((k) => k.position >= t);
  
    if (index !== -1) {
      if (index > 0) {
        const k1 = this.alphaKeys[index - 1];
        const k2 = this.alphaKeys[index];
        const pct = (t - k1.position) / (k2.position - k1.position)
  
        a = lerp(k1.value, k2.value, pct)
      }
      else {
        a = this.alphaKeys[0].value;
      }
    }
  
    // Find first key that is greater than or equal to t.
    index = this.colorKeys.findIndex((k) => k.position >= t);
  
    if (index !== -1) {
      if (index > 0) {
        const k1 = this.colorKeys[index - 1];
        const k2 = this.colorKeys[index];
        const pct = (t - k1.position) / (k2.position - k1.position)
  
        c = lerp(k1.value.slice(0, 3), k2.value.slice(0, 3), pct);
      }
      else {
        c = this.colorKeys[0].value.slice(0, 3);
      }
    }
  
    return [...c, a];
  }  
};

export default Gradient;
