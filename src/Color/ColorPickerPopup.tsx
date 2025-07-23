import React from 'react';
import { createPortal } from 'react-dom';
import NumberInput from '../Inspector/NumberInput';
import styles from './ColorPicker.module.scss';
import ColorMutator from './ColorMutator';
import Color from './Color';
import HsvPicker from './HsvPicker';
import RgbPicker from './RgbPicker';
import HdrPicker from './HdrPicker';
import ColorSlider from './ColorSlider';

type PropsType = {
  value: number[],
  useAlpha?: boolean,
  useHdr?: boolean,
  parentRect: DOMRect,
  onChange: (value: number[]) => void,
  onClose: () => void,
}

enum ColorMode {
  RGB,
  HSV,
  HDR,
}

const ColorPickerPopup: React.FC<PropsType> = ({
  value,
  useAlpha = false,
  useHdr = false,
  parentRect,
  onChange,
  onClose,
}) => {
  const [alpha, setAlpha] = React.useState<number>(useAlpha ? value[3] : 1);
  const [intensity, setIntensity] = React.useState<number>(0)

  const ref = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<React.CSSProperties>();

  const colorMutator = React.useRef<ColorMutator>()
  const [colorMode, setColorMode] = React.useState<ColorMode>(ColorMode.HDR)

  React.useEffect(() => {
    colorMutator.current = new ColorMutator(new Color(value[0], value[1], value[2], value[3]));

    setIntensity(colorMutator.current!.exposureValue)
  }, [value])

  React.useLayoutEffect(() => {
    const wrapperElement = ref.current;
    const popupElement = popupRef.current;

    if (wrapperElement && popupElement) {
      const wrapperRect = wrapperElement.getBoundingClientRect();
      const popupRect = popupElement.getBoundingClientRect()

      if (parentRect.left + popupRect.width <= wrapperRect.right) {
        setPosition({ left: parentRect.left, bottom: wrapperRect.bottom - parentRect.top });
      } else {
        setPosition({ right: wrapperRect.right - parentRect.right, bottom: wrapperRect.bottom - parentRect.top });
      }
    }
  }, [])

  const handleChange = () => {
    const mutator = colorMutator.current;

    if (mutator) {
      setIntensity(mutator.exposureValue)
      onChange(mutator.colorHdr)
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

  const handleAlphaSliderChange = (a: number) => {
    handleAlphaChange(a / 1000);
  }

  const handleIntensityChange = (newIntensity: number) => {
    const mutator = colorMutator.current;

    if (mutator) {
      mutator.exposureValue = newIntensity;
      handleChange()
    }
  }

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

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
        <div
          ref={popupRef}
          className={styles.popup}
          style={position}
          onClick={handleClick}
        >
          <select className={styles.colorMode} value={colorMode} onChange={handleColorModeChange}>
            <option value={ColorMode.HDR}>RGB 0.0-1.0</option>
            <option value={ColorMode.RGB}>RGB 0-255</option>
            <option value={ColorMode.HSV}>HSV</option>
          </select>
          {
            (() => {
              switch (colorMode) {
                case ColorMode.HDR:
                  return (
                    <HdrPicker colorMutator={colorMutator.current} onChange={handleChange} />
                  )

                  case ColorMode.RGB:
                    return (
                      <RgbPicker colorMutator={colorMutator.current} onChange={handleChange} />
                    )

                case ColorMode.HSV:
                  return (
                    <HsvPicker colorMutator={colorMutator.current} onChange={handleChange} />
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
                  <ColorSlider
                    className={styles.alphaGradient} value={alpha * 1000}
                    min={0}
                    max={1000}
                    onChange={handleAlphaSliderChange}
                  />
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
      </div>,
      document.body,
    )
  )
}

export default ColorPickerPopup;
