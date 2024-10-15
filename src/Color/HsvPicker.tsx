import React from 'react';
import convert from 'color-convert';
import ColorSlider from './ColorSlider';
import styles from './ColorPicker.module.scss';
import NumberInput from '../Inspector/NumberInput';
import type ColorMutator from './ColorMutator';

type PropsType = {
  colorMutator?: ColorMutator,
  onChange: () => void,
}

const HsvPicker: React.FC<PropsType> = ({
  colorMutator,
  onChange,
}) => {
  const [h, setH] = React.useState(0);
  const [s, setS] = React.useState(0);
  const [v, setV] = React.useState(0);
  const [saturationRange, setSaturationRange] = React.useState<string>('')
  const [valueRange, setValueRange] = React.useState<string>('')

  const updateHsvGradients = React.useCallback(() => {
    const mutator = colorMutator;

    if (mutator) {
      const s1 = convert.hsv.rgb([mutator.hsv[0] * 360, 0, mutator.hsv[2] * 100]);
      const s2 = convert.hsv.rgb([mutator.hsv[0] * 360, 100, mutator.hsv[2] * 100]);
      setSaturationRange(`rgb(${s1.join()}), rgb(${s2.join()})`)

      const v1 = convert.hsv.rgb([mutator.hsv[0] * 360, mutator.hsv[1] * 100, 0]);
      const v2 = convert.hsv.rgb([mutator.hsv[0] * 360, mutator.hsv[1] * 100, 100]);
      setValueRange(`rgb(${v1.join()}), rgb(${v2.join()})`)
    }
  }, [colorMutator])

  React.useEffect(() => {
    if (colorMutator) {
      setH(Math.round(colorMutator.hsv[0] * 360))
      setS(Math.round(colorMutator.hsv[1] * 100))
      setV(Math.round(colorMutator.hsv[2] * 100))

      updateHsvGradients();
    }
  }, [colorMutator, updateHsvGradients])

  const handleSChange = (s: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setHSVColorChannel(1, s / 100);

      setS(s);

      onChange();
      updateHsvGradients();
    }
  }

  const handleHChange = (h: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setHSVColorChannel(0, h / 360);

      setH(h);

      onChange();
      updateHsvGradients();
    }
  }

  const handleVChange = (v: number) => {
    const mutator = colorMutator;

    if (mutator) {
      mutator.setHSVColorChannel(2, v / 100);

      setV(v);

      onChange();
      updateHsvGradients();
    }
  }

  return (
    <>
      <label>
        H:
        <ColorSlider
          className={styles.hueGradient}
          min={0}
          max={360}
          onChange={handleHChange}
          value={h}
        />
        <NumberInput value={h} onChange={handleHChange} />
      </label>
      <label>
        S:
        <ColorSlider
          style={{ background: `linear-gradient(90deg, ${saturationRange})`}}
          onChange={handleSChange}
          value={s}
        />
        <NumberInput value={s} onChange={handleSChange} />
      </label>
      <label>
        V:
        <ColorSlider
          style={{ background: `linear-gradient(90deg, ${valueRange})`}}
          onChange={handleVChange}
          value={v}
        />
        <NumberInput value={v} onChange={handleVChange} />
      </label>
    </>
  )
}

export default HsvPicker;
