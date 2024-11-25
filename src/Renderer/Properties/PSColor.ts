import { observable, runInAction } from 'mobx';
import { lerp } from '../Math';
import type { PSColorDescriptor} from '../ParticleSystem/Types';
import { PSColorType } from '../ParticleSystem/Types';
import Gradient from '../ParticleSystem/Gradient';
import type { PropertyType } from './Types';
import PropertyBase from './PropertyBase';

type ColorPair = [number[], number[]];

class PSColor extends PropertyBase {
  @observable
  accessor _type = PSColorType.Constant;

  get style(): PSColorType {
    return this._type
  }

  set style(value: PropertyType<PSColorType>) {
    runInAction(() => {
      this._type = value.value;
      if (value.override) {
        this.override = value.override
      }
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
      if (value.override) {
        this.override = value.override
      }
    })
  }

  gradients: [Gradient, Gradient];

  constructor(
    descriptor?: PSColorDescriptor, onChange?: () => void,
  ) {
    super();

    this.gradients = [new Gradient(this), new Gradient(this)]

    if (descriptor) {
      this.applyDescriptor(descriptor)
    }

    this.onChange = onChange;

    this.reactOnChange(() => ({
      override: this.override,
      type: this._type,
      color: this._color,
      gradients: [
        {
          alphaKeys: this.gradients[0].alphaKeys,
          colorKeys: this.gradients[0].colorKeys,
        },
        {
          alphaKeys: this.gradients[1].alphaKeys,
          colorKeys: this.gradients[1].colorKeys,
        },
      ],
    }));
  }

  update(_descriptor?: PSColorDescriptor) {

  }

  applyDescriptor(descriptor: PSColorDescriptor) {
    this.style = { value: descriptor.type ?? PSColorType.Constant };
    this.color = descriptor.color !== undefined
      ? { value: [[...descriptor.color[0]], [...descriptor.color[1]]] }
      : { value: [[1, 1, 1, 1], [1, 1, 1, 1]] };
    this.gradients = descriptor.gradients !== undefined
      ? [
        Gradient.fromDescriptor(descriptor.gradients[0], this),
        Gradient.fromDescriptor(descriptor.gradients[1], this),
      ]
      : [
        new Gradient(this),
        new Gradient(this),
      ];
  }

  toDescriptor(overridesOnly: boolean): PSColorDescriptor | undefined {
    if (!overridesOnly || this.override) {
      return ({
        type: this.style,
        color: [this.color[0].slice(), this.color[1].slice()],
        gradients: [this.gradients[0].toDescriptor(), this.gradients[1].toDescriptor()],
      })
    }
  }

  getColor(t: number): number[] {
    switch (this.style) {
      case PSColorType.Constant:
        return this.color[0];

      case PSColorType.Random: {
        const r = Math.random();

        return lerp(this.color[0], this.color[1], r)
      }

      case PSColorType.Gradient:
        return this.gradients[0].getColor(t);

      case PSColorType.RandomGradient: {
        const color1 = this.gradients[0].getColor(t);
        const color2 = this.gradients[1].getColor(t);

        const r = Math.random();

        return lerp(color1, color2, r)
      }
    }
  }
}

export default PSColor;

