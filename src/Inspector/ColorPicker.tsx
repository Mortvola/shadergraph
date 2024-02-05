import React from 'react';
import NumberInput from './NumberInput';
import styles from './ColorPicker.module.scss'

type PropsType = {
  value: number[],
  onChange: (value: number[]) => void,
}

const ColorPicker: React.FC<PropsType> = ({
  value,
  onChange,
}) => {
  const [red, setRed] = React.useState<number>(value[0]);
  const [green, setGreen] = React.useState<number>(value[1]);
  const [blue, setBlue] = React.useState<number>(value[2]);
  const [brightness, setBrightness] = React.useState<number>(0.299 * red + 0.587 * green + 0.114 * blue)

  const handleRedChange = (r: number) => {
    setRed(r);
    setBrightness((0.299 * r +  0.587 * green  + 0.114 * blue))
    onChange([r, green, blue, 1])
  }

  const handleGreenChange = (g: number) => {
    setGreen(g);
    setBrightness((0.299 * red +  0.587 * g  + 0.114 * blue))
    onChange([red, g, blue, 1])
  }

  const handleBlueChange = (b: number) => {
    setBlue(b);
    setBrightness((0.299 * red +  0.587 * green  + 0.114 * b))
    onChange([red, green, b, 1])
  }

  const handleBrightnessChange = (newBrightness: number) => {
    const colorChange = newBrightness / (0.299 * red +  0.587 * green  + 0.114 * blue)

    setRed((prev) => prev * colorChange)
    setGreen((prev) => prev * colorChange)
    setBlue((prev) => prev * colorChange)

    setBrightness(newBrightness);

    const newRgb = [red * colorChange, green * colorChange, blue * colorChange, 1];

    onChange(newRgb)
  }

  return (
    <div className={styles.color}>
      <div
        className={styles.sample}
        style={{ backgroundColor: `color(srgb-linear ${red * 100}% ${green * 100}% ${blue * 100}% / 100%)` }}
      />
      <label>
        Red:
        <NumberInput value={red} onChange={handleRedChange} />
      </label>
      <label>
        Green:
        <NumberInput value={green} onChange={handleGreenChange} />
      </label>
      <label>
        Blue:
        <NumberInput value={blue} onChange={handleBlueChange} />
      </label>
      <label>
        Brightness:
        <NumberInput value={brightness} onChange={handleBrightnessChange} />
      </label>
    </div>
  )
}

export default ColorPicker;
