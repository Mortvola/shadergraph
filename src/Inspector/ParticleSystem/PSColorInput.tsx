import React from 'react';
import ColorPicker from '../../Color/ColorPicker';
import { PSColorType } from '../../Renderer/ParticleSystem/Types';
import PSColorTypeSelector from './PSColorTypeSelector';
import GradientEditor from '../../Color/GradientEditor';
import type PSColor from '../../Renderer/Properties/PSColor';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: PSColor,
}

const PSColorInput: React.FC<PropsType> = observer(({
  value,
}) => {
  const handleMinChange = (color: number[]) => {
    value.color = {
      value: [
        color,
        value.color[1],
      ],
      override: true,
    }
  }

  const handleMaxChange = (color: number[]) => {
    value.color = {
      value: [
        value.color[0],
        color,
      ],
      override: true,
    }
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    value.style = { value: event.target.value as PSColorType, override: true }
  }

  return (
    <>
      {
        (() => {
          switch (value.style) {
            case PSColorType.Constant:
            case PSColorType.Random:
              return (
                <>
                  <ColorPicker value={value.color[0]} onChange={handleMinChange} useAlpha useHdr />
                  {
                    value.style === PSColorType.Random
                      ? <ColorPicker value={value.color[1]} onChange={handleMaxChange} useAlpha useHdr />
                      : null
                  }
                </>
              )

            case PSColorType.Gradient:
            case PSColorType.RandomeGradient:
              return (
                <>
                  <GradientEditor value={value.gradients[0]} />
                  {
                    value.style === PSColorType.RandomeGradient
                      ? <GradientEditor value={value.gradients[1]} />
                      : null
                  }
                </>
              )
          }
        })()
      }
      <PSColorTypeSelector value={value.style} onChange={handleTypeChange} />
    </>
  )
})

export default PSColorInput;
