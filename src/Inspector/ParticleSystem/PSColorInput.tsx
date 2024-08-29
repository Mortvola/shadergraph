import React from 'react';
import ColorPicker from '../../Color/ColorPicker';
import { PSColorType } from '../../Renderer/ParticleSystem/Types';
import PSColorTypeSelector from './PSColorTypeSelector';
import GradientEditor from '../../Color/GradientEditor';
import PSColor from '../../Renderer/ParticleSystem/PSColor';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: PSColor,
}

const PSColorInput: React.FC<PropsType> = observer(({
  value,
}) => {
  const handleMinChange = (color: number[]) => {
    value.color = [
      color,
      value.color[1],
    ]
  }

  const handleMaxChange = (color: number[]) => {
    value.color = [
      value.color[0],
      color,
    ]
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    value.type = event.target.value as PSColorType
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
            case PSColorType.RandomeGradient:
              return (
                <>
                  <GradientEditor value={value.gradients[0]} />
                  {
                    value.type === PSColorType.RandomeGradient
                      ? <GradientEditor value={value.gradients[1]} />
                      : null
                  }
                </>
              )
          }
        })()
      }
      <PSColorTypeSelector value={value.type} onChange={handleTypeChange} />
    </>
  )
})

export default PSColorInput;
