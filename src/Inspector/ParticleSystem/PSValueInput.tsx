import React from 'react';
import NumberInput from '../NumberInput';
import PSValueTypeSelector from './PSValueTypeSelector';
import { PSValueType } from '../../Renderer/ParticleSystem/Types';
import type PSValue from '../../Renderer/Properties/PSValue';
import { observer } from 'mobx-react-lite';
import CurveEditor from '../../Color/CurveEditor';

type PropsType = {
  value: PSValue,
}

const PSValueInput: React.FC<PropsType> = observer(({
  value,
}) => {
  const handleMinChange = (min: number) => {
    value.value = { value: [min, value.value[1]], override: true }
  }

  const handleMaxChange = (max: number) => {
    value.value = { value: [value.value[0], max], override: true }
  }

  const handleTypeChange = (newValue: PSValueType) => {
    value.style = { value: newValue, override: true }
  }

  const handleRangeChange = (range: [number, number]) => {
    value.curveRange = { value: range, override: true };
  }

  return (
    <>
      {
        (
          () => {
            switch (value.style) {
              case PSValueType.Constant:
              case PSValueType.Random:
                return (
                  <NumberInput
                    value={value.value[0]}
                    onChange={handleMinChange}
                  />        
                )

              case PSValueType.Curve:
                return (
                  <CurveEditor value={value.curve[0]} range={value.curveRange} onRangeChange={handleRangeChange} />
                )
            }

            return null;
          }
        )()
      }
      {
        (
          () => {
            switch (value.style) {
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
      <PSValueTypeSelector value={value.style} onChange={handleTypeChange} />
    </>
  )
})

export default PSValueInput;