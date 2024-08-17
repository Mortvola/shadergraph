import React from 'react';
import ColorSlider from './ColorSlider';
import NumberInput from '../Inspector/NumberInput';
import ColorMutator from './ColorMutator';

type PropsType = {
  colorMutator?: ColorMutator,
  onChange: () => void,
}

const RgbPicker: React.FC<PropsType> = ({
  colorMutator,
  onChange,
}) => {
  const [red, setRed] = React.useState<number>(0);
  const [green, setGreen] = React.useState<number>(0);
  const [blue, setBlue] = React.useState<number>(0);
  const [redRange, setRedRange] = React.useState<string>('')
  const [greenRange, setGreenRange] = React.useState<string>('')
  const [blueRange, setBlueRange] = React.useState<string>('')

  const updateRgbGradients = React.useCallback(() => {
    const mutator = colorMutator;

    if (mutator) {
      const r1 = [0, mutator.color[1], mutator.color[2]]
      const r2 = [255, mutator.color[1], mutator.color[2]]
      setRedRange(`rgb(${r1.join()}), rgb(${r2.join()})`)

      const g1 = [mutator.color[0], 0, mutator.color[2]]
      const g2 = [mutator.color[0], 255, mutator.color[2]]
      setGreenRange(`rgb(${g1.join()}), rgb(${g2.join()})`)

      const b1 = [mutator.color[0], mutator.color[1], 0]
      const b2 = [mutator.color[0], mutator.color[1], 255]
      setBlueRange(`rgb(${b1.join()}), rgb(${b2.join()})`)
    }
  }, [colorMutator])

  React.useEffect(() => {
    if (colorMutator) {
      setRed(colorMutator.color[0])
      setGreen(colorMutator.color[1])
      setBlue(colorMutator.color[2])

      updateRgbGradients();
    }
  }, [colorMutator, updateRgbGradients])

  const handleRedChange = (r: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setRGBColorChannel(0, r);

      setRed(r);

      onChange();
      updateRgbGradients();
    }
  }

  const handleGreenChange = (g: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setRGBColorChannel(1, g);

      setGreen(g);

      onChange();
      updateRgbGradients();
    }
  }

  const handleBlueChange = (b: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setRGBColorChannel(2, b);

      setBlue(b);

      onChange();
      updateRgbGradients();
    }
  }

  return (
    <>
      <label>
        R:
        <ColorSlider
          style={{ background: `linear-gradient(90deg, ${redRange})`}}
          min={0}
          max={255}
          onChange={handleRedChange}
          value={red}
        />
        <NumberInput value={red} onChange={handleRedChange} />
      </label>
      <label>
        G:
        <ColorSlider
          style={{ background: `linear-gradient(90deg, ${greenRange})`}}
          min={0}
          max={255}
          onChange={handleGreenChange}
          value={green}
        />
        <NumberInput value={green} onChange={handleGreenChange} />
      </label>
      <label>
        B:
        <ColorSlider
          style={{ background: `linear-gradient(90deg, ${blueRange})`}}
          min={0}
          max={255}
          onChange={handleBlueChange}
          value={blue}
        />
        <NumberInput value={blue} onChange={handleBlueChange} />
      </label>    
    </>
  )
}

export default RgbPicker;
