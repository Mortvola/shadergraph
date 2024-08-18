import React from 'react';
import ColorPicker from '../Color/ColorPicker';
import { Gradient, PSColor, PSColorType } from '../Renderer/types';
import PSColorTypeSelector from './PSColorTypeSelector';
import GradientEditor from '../Color/GradientEditor';

type PropsType = {
  value: PSColor,
  onChange: (value: PSColor) => void,
}

const PSColorInput: React.FC<PropsType> = ({
  value,
  onChange,
}) => {
  const handleMinChange = (color: number[]) => {
    onChange({
      ...value,
      color: [
        color,
        value.color[1].slice(),
      ]
    })
  }

  const handleMaxChange = (color: number[]) => {
    onChange({
      ...value,
      color: [
        value.color[0].slice(),
        color,
      ]
    })
  }

  const handleGradientChange = (gradient: Gradient) => {
    onChange({
      ...value,
      gradient,
    })
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    onChange({
      ...value,
      type: event.target.value as PSColorType,
    })
  }

  return (
    <>
      {
        (() => {
          switch (value.type) {
            case PSColorType.Constant:
            case PSColorType.Random:
              return (
                <>
                  <ColorPicker value={value.color[0]} onChange={handleMinChange} useAlpha useHdr />
                  {
                    value.type === PSColorType.Random
                      ? <ColorPicker value={value.color[1]} onChange={handleMaxChange} useAlpha useHdr />
                      : null
                  }
                </>
              )

            case PSColorType.Gradient:
              return (
                <GradientEditor value={value.gradient} onChange={handleGradientChange} />
              )
          }
        })()
      }
      <PSColorTypeSelector value={value.type} onChange={handleTypeChange} />
    </>
  )
}

export default PSColorInput;
