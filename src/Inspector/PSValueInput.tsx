import React from 'react';
import NumberInput from './NumberInput';
import PSValueTypeSelector from './PSValueTypeSelector';
import { PSValueType } from '../Renderer/types';
import PSValue from './PSValue';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: PSValue,
}

const PSValueInput: React.FC<PropsType> = observer(({
  value,
}) => {
  const handleMinChange = (min: number) => {
    if (value.type === PSValueType.Curve) {
      value.setMinCurve(min)
    }
    else {
      value.setMinValue(min)
    }
  }

  const handleMaxChange = (max: number) => {
    if (value.type === PSValueType.Curve) {
      value.setMaxCurve(max)
    }
    else {
      value.setMaxValue(max)
    }
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    value.setType(event.target.value as PSValueType)
  }

  return (
    <>
      <NumberInput
        value={value.type === PSValueType.Curve ? value.curve[0].points[0][1] : value.value[0]}
        onChange={handleMinChange}
      />
      {
        value.type === PSValueType.Random || value.type === PSValueType.Curve
          ? (
            <NumberInput
              value={value.type === PSValueType.Curve ? value.curve[0].points[1][1] : value.value[1]}
              onChange={handleMaxChange}
            />
          )
          : null
      }
      <PSValueTypeSelector value={value.type} onChange={handleTypeChange} />
    </>
  )
})

export default PSValueInput;