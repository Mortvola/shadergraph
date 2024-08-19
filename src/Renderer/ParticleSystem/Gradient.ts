import { makeObservable, observable, runInAction } from "mobx";
import { lerp } from "../Math";
import { AlphaGradientKey, ColorGradientKey, GradientDescriptor } from "./Types";

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

  onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange;

    makeObservable(this, {
      alphaKeys: observable,
      colorKeys: observable,
    })
  }
  
  static fromDescriptor(descriptor: GradientDescriptor, onChange?: () => void) {
    const gradient = new Gradient(onChange);

    gradient.alphaKeys = descriptor.alphaKeys.map((k) => ({ ...k }));
    gradient.colorKeys = descriptor.colorKeys.map((k) => ({ ...k }));

    return gradient;
  }

  toDescriptor(): GradientDescriptor {
    return ({
      alphaKeys: this.alphaKeys.slice(),
      colorKeys: this.colorKeys.slice(),
    })
  }

  addAlphaKey(position: number) {
    // Find first key that is greater than this position
    const index = this.alphaKeys.findIndex((k) => k.position > position);

    if (index > 0) {
      const newKey: AlphaGradientKey = {
        id: this.alphaKeys.reduce((prev, k) => (Math.max(prev, k.id)), 0) + 1,
        position,
        value: this.alphaKeys[0].value,
      };

      runInAction(() => {
        this.alphaKeys = [
          ...this.alphaKeys.slice(0, index),
          newKey,
          ...this.alphaKeys.slice(index),
        ];

        if (this.onChange) {
          this.onChange();
        }
      })

      return newKey;
    }
  }

  addColorKey(position: number) {
    // Find first key that is greater than this position
    const index = this.colorKeys.findIndex((k) => k.position > position);

    if (index > 0) {
      const newKey: ColorGradientKey = {
        id: this.colorKeys.reduce((prev, k) => (Math.max(prev, k.id)), 0) + 1,
        position,
        value: this.colorKeys[0].value.slice(), // Copy the previous key value
      };

      runInAction(() => {
        this.colorKeys = [
          ...this.colorKeys.slice(0, index),
          newKey,
          ...this.colorKeys.slice(index),
        ];

        if (this.onChange) {
          this.onChange();
        }
      })

      return newKey;
    }
  }

  deleteAlphaKey(id: number) {
    // Find index of selected alpha key
    const index = this.alphaKeys.findIndex((k) => k.id === id);

    // Don't delete the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== this.alphaKeys.length - 1
    ) {
      runInAction(() => {
        this.alphaKeys = [
          ...this.alphaKeys.slice(0, index),
          ...this.alphaKeys.slice(index + 1),
        ];

        if (this.onChange) {
          this.onChange();
        }
      })
    }
  }

  deleteColorKey(id: number) {
    // Find index of selected alpha key
    const index = this.colorKeys.findIndex((k) => k.id === id);

    // Don't delete the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== this.colorKeys.length - 1
    ) {
      runInAction(() => {
        this.colorKeys = [
          ...this.colorKeys.slice(0, index),
          ...this.colorKeys.slice(index + 1),
        ]

        if (this.onChange) {
          this.onChange();
        }
      })
    }
  }

  moveAlphaKey(id: number, position: number) {
    // Find index of selected alpha key
    const index = this.alphaKeys.findIndex((k) => k.id === id);

    // Don't move the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== this.alphaKeys.length - 1
    ) {
      runInAction(() => {
        this.alphaKeys = [
          ...this.alphaKeys.slice(0, index),
          {
            ...this.alphaKeys[index],
            position,
          },
          ...this.alphaKeys.slice(index + 1),
        ]

        if (this.onChange) {
          this.onChange();
        }
      })

      return true;
    }

    return false;
  }

  moveColorKey(id: number, position: number) {
    // Find index of selected alpha key
    const index = this.colorKeys.findIndex((k) => k.id === id);

    // Don't move the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== this.colorKeys.length - 1
    ) {
      runInAction(() => {
        this.colorKeys = [
          ...this.colorKeys.slice(0, index),
          {
            ...this.colorKeys[index],
            position,
          },
          ...this.colorKeys.slice(index + 1),
        ]

        if (this.onChange) {
          this.onChange();
        }
      })

      return true;
    }

    return false;
  }

  alphaChange(id: number, a: number) {
    const index = this.alphaKeys.findIndex((k) => k.id === id);

    if (index !== -1) {
      runInAction(() => {
        this.alphaKeys = [
          ...this.alphaKeys.slice(0, index),
          {
            ...this.alphaKeys[index],
            value: a / 255.0,
          },
          ...this.alphaKeys.slice(index + 1),
        ];

        if (this.onChange) {
          this.onChange();
        }
      })

      return true;
    }

    return false;
  }

  colorChange(id: number, color: number[]) {
    const index = this.colorKeys.findIndex((k) => k.id === id);

    if (index !== -1) {
      runInAction(() => {
        this.colorKeys = [
          ...this.colorKeys.slice(0, index),
          {
            ...this.colorKeys[index],
            value: color,
          },
          ...this.colorKeys.slice(index + 1),
        ];

        if (this.onChange) {
          this.onChange();
        }
      })

      return true;
    }

    return false;
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
