import React from 'react';
import NumberInput from '../Inspector/NumberInput';
import type ColorMutator from './ColorMutator';
import ColorSlider from './ColorSlider';

type PropsType = {
  colorMutator?: ColorMutator,
  onChange: () => void,
}

const HdrPicker: React.FC<PropsType> = ({
  colorMutator,
  onChange,
}) => {
  const [hdrRed, setHdrRed] = React.useState<number>(0);
  const [hdrGreen, setHdrGreen] = React.useState<number>(0);
  const [hdrBlue, setHdrBlue] = React.useState<number>(0);
  const [redRange, setRedRange] = React.useState<string>('')
  const [greenRange, setGreenRange] = React.useState<string>('')
  const [blueRange, setBlueRange] = React.useState<string>('')

  const sliderScale = 1000;

  React.useEffect(() => {
    const red = Math.round(hdrRed * 255);
    const green = Math.round(hdrGreen * 255);
    const blue = Math.round(hdrBlue * 255);

    const r1 = [0, green, blue]
    const r2 = [255, green, blue]
    setRedRange(`rgb(${r1.join()}), rgb(${r2.join()})`)

    const g1 = [red, 0, blue]
    const g2 = [red, 255, blue]
    setGreenRange(`rgb(${g1.join()}), rgb(${g2.join()})`)

    const b1 = [red, green, 0]
    const b2 = [red, green, 255]
    setBlueRange(`rgb(${b1.join()}), rgb(${b2.join()})`)
  }, [hdrBlue, hdrGreen, hdrRed])

  React.useEffect(() => {
    if (colorMutator) {
      setHdrRed(colorMutator.colorHdr[0])
      setHdrGreen(colorMutator.colorHdr[1])
      setHdrBlue(colorMutator.colorHdr[2])
    }
  }, [colorMutator])

  const handleHdrRedChange = (r: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setColorChannel(0, r);

      setHdrRed(r);
      onChange()
    }
  }

  const handleRedSliderChange = (r: number) => {
    handleHdrRedChange(r / sliderScale);
  }

  const handleHdrGreenChange = (g: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setColorChannel(1, g);

      setHdrGreen(g);
      onChange()
    }
  }

  const handleGreenSliderChange = (g: number) => {
    handleHdrGreenChange(g / sliderScale);
  }

  const handleHdrBlueChange = (b: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setColorChannel(2, b);

      setHdrBlue(b);
      onChange()
    }
  }

  const handleBlueSliderChange = (b: number) => {
    handleHdrBlueChange(b / sliderScale);
  }

  return (
    <>
      <label>
        R:
        <ColorSlider
          style={{ background: `linear-gradient(90deg, ${redRange})`}}
          min={0}
          max={sliderScale}
          value={hdrRed * sliderScale}
          onChange={handleRedSliderChange}
        />
        <NumberInput value={hdrRed} onChange={handleHdrRedChange} />
      </label>
      <label>
        G:
        <ColorSlider
          style={{ background: `linear-gradient(90deg, ${greenRange})`}}
          min={0}
          max={sliderScale}
          value={hdrGreen * sliderScale}
          onChange={handleGreenSliderChange}
        />
        <NumberInput value={hdrGreen} onChange={handleHdrGreenChange} />
      </label>
      <label>
        B:
        <ColorSlider
          style={{ background: `linear-gradient(90deg, ${blueRange})`}}
          min={0}
          max={sliderScale}
          value={hdrBlue * sliderScale}
          onChange={handleBlueSliderChange}
        />
        <NumberInput value={hdrBlue} onChange={handleHdrBlueChange} />
      </label>    
    </>
  )
}

export default HdrPicker;
