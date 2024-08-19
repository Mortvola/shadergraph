import React from 'react';
import NumberInput from './NumberInput';
import PSValueTypeSelector from './PSValueTypeSelector';
import { PSValue, PSValueType } from '../Renderer/types';

type PropsType = {
  value: PSValue,
  onChange: (value: PSValue) => void,
}

const PSValueInput: React.FC<PropsType> = ({
  value,
  onChange,
}) => {
  const handleMinChange = (min: number) => {
    if (value.type === PSValueType.Curve) {
      onChange({
        ...value,
        curve: [
          {
            points: [[0, min], [1, value.curve[0].points[1][1]]],
          },
          {
            points: [...value.curve[1].points],
          }
        ]
      })  
    }
    else {
      onChange({
        ...value,
        value: [min, value.value[1]]
      })  
    }
  }

  const handleMaxChange = (max: number) => {
    if (value.type === PSValueType.Curve) {
      onChange({
        ...value,
        curve: [
          {
            points: [[0, value.curve[0].points[0][1]], [1, max]],
          },
          {
            points: [...value.curve[1].points],
          }
        ]
      })  
    }
    else {
      onChange({
        ...value,
        value: [value.value[0], max]
      })
    }
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    onChange({
      ...value,
      type: event.target.value as PSValueType,
    })
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
}

export default PSValueInput;