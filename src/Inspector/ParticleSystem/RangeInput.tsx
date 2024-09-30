import React from 'react';
import NumberInput from '../NumberInput';
import type PSValue2 from '../../Renderer/Properties/PSValue2';

type PropsType = {
  value: PSValue2,
}

const RangeInput: React.FC<PropsType> = ({
  value,
}) => {
  const handleMinChange = (min: number) => {
    value.value = { value: [min, value.value[1]], override: true }
  }

  const handleMaxChange = (max: number) => {
    value.value = { value: [value.value[0], max], override: true }
  }

  return (
    <div>
      <NumberInput
        value={value.value[0]}
        onChange={handleMinChange}
      />
      <NumberInput
        value={value.value[1]}
        onChange={handleMaxChange}
      />
    </div>
  )
}

export default RangeInput;
