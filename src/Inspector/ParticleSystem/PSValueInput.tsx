import React from 'react';
import NumberInput from '../NumberInput';
import PSValueTypeSelector from './PSValueTypeSelector';
import { PSValueType } from '../../Renderer/ParticleSystem/Types';
import PSValue from '../../Renderer/ParticleSystem/PSValue';
import { observer } from 'mobx-react-lite';
import CurveEditor from '../../Color/CurveEditor';

type PropsType = {
  value: PSValue,
}

const PSValueInput: React.FC<PropsType> = observer(({
  value,
}) => {
  const handleMinChange = (min: number) => {
    value.setMinValue(min)
  }

  const handleMaxChange = (max: number) => {
    value.setMaxValue(max)
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    value.setType(event.target.value as PSValueType)
  }

  return (
    <>
      {
        (
          () => {
            switch (value.type) {
              case PSValueType.Constant:
                return (
                  <NumberInput
                    value={value.value[0]}
                    onChange={handleMinChange}
                  />        
                )

              case PSValueType.Curve:
                return (
                  <CurveEditor value={value.curve[0]} />
                )
            }

            return null;
          }
        )()
      }
      {
        (
          () => {
            switch (value.type) {
              case PSValueType.Random:
                return (
                  <NumberInput
                    value={value.value[1]}
                    onChange={handleMaxChange}
                  />    
                )
            }

            return null;
          }
        )()
      }
      <PSValueTypeSelector value={value.type} onChange={handleTypeChange} />
    </>
  )
})

export default PSValueInput;