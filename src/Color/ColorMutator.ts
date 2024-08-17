import convert from 'color-convert';
import Color from './Color';

const MaxByteForOverexposedColor = 191;

class ColorMutator {
  private originalColor: Color;
  
  colorHdr: number[];

  private hdrBaseColor: Color;

  color: number[] = [0, 0, 0, 1];

  hsv: number[] = [0, 0, 0];

  private baseExposure: number = 0;

  private exposure: number = 0;

  constructor(originalColor: Color) {
    this.originalColor = originalColor;

    this.colorHdr = [
      originalColor.r,
      originalColor.g,
      originalColor.b,
      originalColor.a,
    ]

    this.hdrBaseColor = new Color(originalColor.r, originalColor.g, originalColor.b, originalColor.a)

    this.hdrChannelChanged(-1);
  
    this.baseExposure = this.exposureValue;
  }

  get exposureValue() {
    return this.exposure;
  }

  set exposureValue(value: number) {
    this.exposure = value;

    const factor = Math.pow(2, this.exposure - this.baseExposure);

    this.colorHdr[0] = this.hdrBaseColor.r * factor;
    this.colorHdr[1] = this.hdrBaseColor.g * factor;
    this.colorHdr[2] = this.hdrBaseColor.b * factor;
  }

  get exposureAdjustedColor() {
    return new Color(this.colorHdr[0], this.colorHdr[1], this.colorHdr[2], this.colorHdr[3])
  }

  setColorChannel(index: number, value: number) {
    this.colorHdr[index] = value;
    this.hdrBaseColor = new Color(this.colorHdr[0], this.colorHdr[1], this.colorHdr[2], this.colorHdr[3]);
    this.hdrChannelChanged(index);
    this.baseExposure = this.exposureValue;
  }

  setRGBColorChannel(index: number, value: number) {
    this.color[index] = Math.min(Math.max(Math.round(value), 0), 255);

    this.colorHdr[index] = value / 255;

    if (index === 3) {
      return
    }

    this.colorHdr[index] *= Math.pow(2, this.exposure)

    const hsv = convert.rgb.hsv(this.color[0], this.color[1], this.color[2])

    this.hsv[0] = hsv[0] / 360;
    this.hsv[1] = hsv[1] / 100;
    this.hsv[2] = hsv[2] / 100;
  }

  setHSVColorChannel(index: number, value: number) {
    this.hsv[index] = Math.max(Math.min(value, 1), 0);

    const hsv: [number, number, number] = [
      this.hsv[0] * 360,
      this.hsv[1] * 100,
      this.hsv[2] * 100,
    ]
  
    const rgb = convert.hsv.rgb(hsv);

    this.color[0] = rgb[0];
    this.color[1] = rgb[1];
    this.color[2] = rgb[2];
    
    const factor = Math.pow(2, this.exposureValue)

    this.colorHdr[0] = this.color[0] / 255.0 * factor;
    this.colorHdr[1] = this.color[1] / 255.0 * factor;
    this.colorHdr[2] = this.color[2] / 255.0 * factor;

    this.hdrBaseColor = new Color(this.colorHdr[0], this.colorHdr[1], this.colorHdr[2], this.colorHdr[3])
  }

  private hdrChannelChanged(index: number) {
    this.color[3] = Math.min(Math.max(Math.round(this.colorHdr[3] * 255), 0), 255);

    if (index === 3) {
      return;
    }

    const { baseLinearColor, exposure } = ColorMutator.decomposeHdrColor(this.exposureAdjustedColor)

    this.color[0] = baseLinearColor.r
    this.color[1] = baseLinearColor.g
    this.color[2] = baseLinearColor.b

    this.exposure = exposure;

    const hsv = convert.rgb.hsv(this.color[0], this.color[1], this.color[2])

    this.hsv[0] = hsv[0] / 360;
    this.hsv[1] = hsv[1] / 100;
    this.hsv[2] = hsv[2] / 100;
  }

  private static decomposeHdrColor(linearColorHdr: Color): { baseLinearColor: Color, exposure: number } {
    const baseLinearColor = linearColorHdr;
    const maxColorComponent = linearColorHdr.maxColorComponent()
    let exposure = 0;

    if (maxColorComponent === 0 || (maxColorComponent <= 1.0 && maxColorComponent > 1 / 255.0)) {
      baseLinearColor.r = Math.round(linearColorHdr.r * 255);
      baseLinearColor.g = Math.round(linearColorHdr.g * 255);
      baseLinearColor.b = Math.round(linearColorHdr.b * 255);
    }
    else {
      const scaleFactor = MaxByteForOverexposedColor / maxColorComponent;
      exposure = Math.log(255 / scaleFactor) / Math.log(2);

      baseLinearColor.r = Math.min(MaxByteForOverexposedColor, Math.ceil(scaleFactor * linearColorHdr.r))
      baseLinearColor.g = Math.min(MaxByteForOverexposedColor, Math.ceil(scaleFactor * linearColorHdr.g))
      baseLinearColor.b = Math.min(MaxByteForOverexposedColor, Math.ceil(scaleFactor * linearColorHdr.b))
    }

    return { baseLinearColor, exposure }
  }
}

export default ColorMutator;
