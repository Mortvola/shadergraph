import { observable, runInAction } from 'mobx';
import { lerp } from '../Math';
import type { AlphaGradientKey, ColorGradientKey, GradientDescriptor } from './Types';

class Gradient {
  @observable
  accessor alphaKeys: AlphaGradientKey[] = [
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

  @observable
  accessor colorKeys: ColorGradientKey[] = [
    {
      id: 0,
      position: 0,
      value: [1, 1, 1],
    },
    {
      id: 1,
      position: 1,
      value: [1, 1, 1],
    }
  ]

  parent?: { override: boolean }

  constructor(parent?: { override: boolean }) {
    this.parent = parent;
  }

  copy(other: Gradient) {
    runInAction(() => {
      this.alphaKeys = JSON.parse(JSON.stringify(other.alphaKeys))
      this.colorKeys = JSON.parse(JSON.stringify(other.colorKeys))
    })
  }

  static fromDescriptor(descriptor: GradientDescriptor, parent?: { override: boolean }) {
    const gradient = new Gradient(parent);

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

  addAlphaKey(position: number, override?: boolean) {
    // Find first key that is greater than this position
    const index = this.alphaKeys.findIndex((k) => k.position > position);

    if (index > 0) {
      const newKey: AlphaGradientKey = {
        id: this.alphaKeys.reduce((prev, k) => (Math.max(prev, k.id)), 0) + 1,
        position,
        value: this.alphaKeys[0].value,
      };

      runInAction(() => {
        if (this.parent) {
          this.parent.override = override ?? this.parent.override
        }

        this.alphaKeys = [
          ...this.alphaKeys.slice(0, index),
          newKey,
          ...this.alphaKeys.slice(index),
        ];
      })

      return newKey;
    }
  }

  addColorKey(position: number, override?: boolean) {
    // Find first key that is greater than this position
    const index = this.colorKeys.findIndex((k) => k.position > position);

    if (index > 0) {
      const newKey: ColorGradientKey = {
        id: this.colorKeys.reduce((prev, k) => (Math.max(prev, k.id)), 0) + 1,
        position,
        value: this.colorKeys[0].value.slice(), // Copy the previous key value
      };

      runInAction(() => {
        if (this.parent) {
          this.parent.override = override ?? this.parent.override
        }

        this.colorKeys = [
          ...this.colorKeys.slice(0, index),
          newKey,
          ...this.colorKeys.slice(index),
        ];
      })

      return newKey;
    }
  }

  deleteAlphaKey(id: number, override?: boolean) {
    // Find index of selected alpha key
    const index = this.alphaKeys.findIndex((k) => k.id === id);

    // Don't delete the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== this.alphaKeys.length - 1
    ) {
      runInAction(() => {
        if (this.parent) {
          this.parent.override = override ?? this.parent.override
        }

        this.alphaKeys = [
          ...this.alphaKeys.slice(0, index),
          ...this.alphaKeys.slice(index + 1),
        ];
      })
    }
  }

  deleteColorKey(id: number, override?: boolean) {
    // Find index of selected alpha key
    const index = this.colorKeys.findIndex((k) => k.id === id);

    // Don't delete the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== this.colorKeys.length - 1
    ) {
      runInAction(() => {
        if (this.parent) {
          this.parent.override = override ?? this.parent.override
        }

        this.colorKeys = [
          ...this.colorKeys.slice(0, index),
          ...this.colorKeys.slice(index + 1),
        ]
      })
    }
  }

  moveAlphaKey(id: number, position: number, override?: boolean) {
    // Find index of selected alpha key
    const index = this.alphaKeys.findIndex((k) => k.id === id);

    // Don't move the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== this.alphaKeys.length - 1
    ) {
      runInAction(() => {
        if (this.parent) {
          this.parent.override = override ?? this.parent.override
        }

        this.alphaKeys = [
          ...this.alphaKeys.slice(0, index),
          {
            ...this.alphaKeys[index],
            position,
          },
          ...this.alphaKeys.slice(index + 1),
        ]
      })

      return true;
    }

    return false;
  }

  moveColorKey(id: number, position: number, override?: boolean) {
    // Find index of selected alpha key
    const index = this.colorKeys.findIndex((k) => k.id === id);

    // Don't move the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== this.colorKeys.length - 1
    ) {
      runInAction(() => {
        if (this.parent) {
          this.parent.override = override ?? this.parent.override
        }

        this.colorKeys = [
          ...this.colorKeys.slice(0, index),
          {
            ...this.colorKeys[index],
            position,
          },
          ...this.colorKeys.slice(index + 1),
        ]
      })

      return true;
    }

    return false;
  }

  alphaChange(id: number, a: number, override?: boolean) {
    const index = this.alphaKeys.findIndex((k) => k.id === id);

    if (index !== -1) {
      runInAction(() => {
        if (this.parent) {
          this.parent.override = override ?? this.parent.override
        }

        this.alphaKeys = [
          ...this.alphaKeys.slice(0, index),
          {
            ...this.alphaKeys[index],
            value: a / 255.0,
          },
          ...this.alphaKeys.slice(index + 1),
        ];
      })

      return true;
    }

    return false;
  }

  colorChange(id: number, color: number[], override?: boolean) {
    const index = this.colorKeys.findIndex((k) => k.id === id);

    if (index !== -1) {
      runInAction(() => {
        if (this.parent) {
          this.parent.override = override ?? this.parent.override
        }

        this.colorKeys = [
          ...this.colorKeys.slice(0, index),
          {
            ...this.colorKeys[index],
            value: color,
          },
          ...this.colorKeys.slice(index + 1),
        ];
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
