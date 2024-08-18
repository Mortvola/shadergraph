import { lerp } from "../Renderer/Math";
import { AlphaGradientKey, ColorGradientKey } from "../Renderer/types";

export class Color {
  r = 0;

  g = 0;

  b = 0;

  a = 1;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  maxColorComponent() {
    return Math.max(this.r, this.g, this.b)
  }
}

export const getGradientCss = (colorKeys: ColorGradientKey[], alphaKeys: AlphaGradientKey[]) => {
  let a = 1;
  let c = 1;
  let color: number[] = colorKeys[0].value.slice(0, 3);
  let alpha: number = alphaKeys[0].value;
  let position = 0;

  const toString = (color: number[], alpha: number, position: number) => (
    `rgba(${color.map((c) => Math.round(c * 255)).join(' ')} / ${Math.round(alpha * 100)}%) ${(Math.round(position * 100))}%`
  )

  let gradient = toString(color, alpha, position);

  while (position < 1) {
    if (colorKeys[c].position < alphaKeys[a].position) {
      color = colorKeys[c].value.slice(0,3);
      position = colorKeys[c].position

      const pct = (position - alphaKeys[a - 1].position) / (alphaKeys[a].position - alphaKeys[a - 1].position);
      alpha = lerp(alphaKeys[a - 1].value, alphaKeys[a].value, pct)

      c += 1;
    }
    else if (colorKeys[c].position > alphaKeys[a].position) {
      alpha = alphaKeys[a].value;
      position = alphaKeys[a].position

      const pct = (position - colorKeys[c - 1].position) / (colorKeys[c].position - colorKeys[c - 1].position);
      color = lerp(colorKeys[c - 1].value.slice(0, 3), colorKeys[c].value.slice(0, 3), pct)

      a += 1;
    }
    else {
      color = colorKeys[c].value.slice(0,3);
      alpha = alphaKeys[a].value;
      position = colorKeys[c].position

      c += 1;
      a += 1;
    }

    gradient += ', ' + toString(color, alpha, position);
  }

  return gradient;
}

export default Color;
