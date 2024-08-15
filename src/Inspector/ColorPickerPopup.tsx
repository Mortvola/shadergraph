import React from 'react';
import NumberInput from './NumberInput';
import styles from './ColorPicker.module.scss';
import { createPortal } from 'react-dom';
import ColorMutator from './ColorMutator';
import Color from './Color';

type PropsType = {
  value: number[],
  useAlpha?: boolean,
  useHdr?: boolean,
  rect: DOMRect,
  onChange: (value: number[]) => void,
  onClose: () => void,
}

enum ColorMode {
  RGB,
  HSV,
  HDR
}

const ColorPickerPopup: React.FC<PropsType> = ({
  value,
  useAlpha = false,
  useHdr = false,
  rect,
  onChange,
  onClose,
}) => {
  const [hdrRed, setHdrRed] = React.useState<number>(value[0]);
  const [hdrGreen, setHdrGreen] = React.useState<number>(value[1]);
  const [hdrBlue, setHdrBlue] = React.useState<number>(value[2]);

  const [red, setRed] = React.useState<number>(0);
  const [green, setGreen] = React.useState<number>(0);
  const [blue, setBlue] = React.useState<number>(0);

  const [h, setH] = React.useState(0);
  const [s, setS] = React.useState(0);
  const [v, setV] = React.useState(0);

  const [alpha, setAlpha] = React.useState<number>(useAlpha ? value[3] : 1);

  const [intensity, setIntensity] = React.useState<number>(0)
  
  const ref = React.useRef<HTMLDivElement>(null);
  const [wrapperBounds, setWrapperBounds] = React.useState<DOMRect>();
  const colorMutator = React.useRef<ColorMutator>()
  const [colorMode, setColorMode] = React.useState<ColorMode>(ColorMode.HDR)

  React.useEffect(() => {
    if (!colorMutator.current) {
      console.log('allocate color mutator')
      colorMutator.current = new ColorMutator(new Color(value[0], value[1], value[2], value[3]));

      setRed(colorMutator.current.color[0])
      setGreen(colorMutator.current.color[1])
      setBlue(colorMutator.current.color[2])

      setH(colorMutator.current.hsv[0])
      setS(colorMutator.current.hsv[1])
      setV(colorMutator.current.hsv[2])

      setIntensity(colorMutator.current!.exposureValue)
    }
  }, [value])

  const handleHdrRedChange = (r: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setColorChannel(0, r);

      setHdrRed(r);
      setIntensity(mutator.exposureValue)  

      onChange(mutator.colorHdr)
    }
  }

  const handleHdrGreenChange = (g: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setColorChannel(1, g);

      setHdrGreen(g);
      setIntensity(mutator.exposureValue)

      onChange(mutator.colorHdr)
    }
  }

  const handleHdrBlueChange = (b: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setColorChannel(2, b);

      setHdrBlue(b);
      setIntensity(mutator.exposureValue)

      onChange(mutator.color)
    }
  }

  const handleAlphaChange = (a: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setColorChannel(3, a);

      setAlpha(a);

      onChange(mutator.colorHdr)
    }
  }

  const hdrChanged = () => {
    const mutator = colorMutator.current;

    if (mutator) {
      setHdrRed(mutator.colorHdr[0])
      setHdrGreen(mutator.colorHdr[1])
      setHdrBlue(mutator.colorHdr[2])
      setIntensity(mutator.exposureValue)

      onChange(mutator.colorHdr)
    }
  }

  const handleRedChange = (r: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setRGBColorChannel(0, r);

      setRed(r);

      hdrChanged();
    }
  }

  const handleGreenChange = (g: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setRGBColorChannel(1, g);

      setGreen(g);

      hdrChanged();
    }
  }

  const handleBlueChange = (b: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setRGBColorChannel(2, b);

      setBlue(b);

      hdrChanged();
    }
  }

  const handleSChange = (s: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setHSVColorChannel(0, s);

      setS(s);

      hdrChanged();
    }
  }

  const handleHChange = (h: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setHSVColorChannel(1, h);

      setH(h);

      hdrChanged();
    }
  }

  const handleVChange = (v: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.setHSVColorChannel(2, v);

      setV(v);

      hdrChanged();
    }
  }

  const handleIntensityChange = (newIntensity: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.exposureValue = newIntensity;

      hdrChanged()
    }
  }

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setWrapperBounds(rect);
    }
  }, [])

  const handleColorModeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setColorMode(parseInt(event.target.value, 10))
  }

  return (
    createPortal(
      <div
        ref={ref}
        className={styles.wrapper}
        onClick={onClose}
      >
        {
          wrapperBounds
            ? (
              <div className={styles.popup} style={{ left: rect.left, bottom: wrapperBounds!.bottom - rect.top }} onClick={handleClick}>
                <select value={colorMode} onChange={handleColorModeChange}>
                  <option value={ColorMode.HDR}>RGB 0.0-1.0</option>
                  <option value={ColorMode.RGB}>RGB 0-255</option>
                  <option value={ColorMode.HSV}>HSV</option>
                </select>
                {
                  (() => {
                    switch (colorMode) {
                      case ColorMode.HDR:
                        return (
                            <>
                              <label>
                                R:
                                <NumberInput value={hdrRed} onChange={handleHdrRedChange} />
                              </label>
                              <label>
                                G:
                                <NumberInput value={hdrGreen} onChange={handleHdrGreenChange} />
                              </label>
                              <label>
                                B:
                                <NumberInput value={hdrBlue} onChange={handleHdrBlueChange} />
                              </label>    
                            </>
                        )

                        case ColorMode.RGB:
                          return (
                            <>
                              <label>
                                R:
                                <NumberInput value={red} onChange={handleRedChange} />
                              </label>
                              <label>
                                G:
                                <NumberInput value={green} onChange={handleGreenChange} />
                              </label>
                              <label>
                                B:
                                <NumberInput value={blue} onChange={handleBlueChange} />
                              </label>    
                            </>
                          )

                      case ColorMode.HSV:
                        return (
                          <>
                            <label>
                              H:
                              <NumberInput value={h} onChange={handleHChange} />
                            </label>
                            <label>
                              S:
                              <NumberInput value={s} onChange={handleSChange} />
                            </label>
                            <label>
                              V:
                              <NumberInput value={v} onChange={handleVChange} />
                            </label>    
                          </>
                        )
                    }

                    return null
                  })()
                }
                {
                  useAlpha
                    ? (
                      <label>
                        A:
                        <NumberInput value={alpha} onChange={handleAlphaChange} />
                      </label>
                    )
                    : null                
                }
                {
                  useHdr
                    ? (
                      <label>
                        Intensity:
                        <NumberInput value={intensity} onChange={handleIntensityChange} />
                      </label>    
                    )
                    : null
                }
              </div>
            )
            : null
        }
      </div>,
      document.body,
    )
  )
}

export default ColorPickerPopup;
