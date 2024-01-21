import React from 'react';
import Float from '../Float';
import { useStores } from '../State/store';
import Value from '../shaders/ShaderBuilder/Value';

type PropsType = {
  value: Value,
}

const SimpleFloat: React.FC<PropsType> = ({
  value,
}) => {
  const store = useStores();

  const handleChange = (newValue: number, index?: number) => {
    value.value = newValue;
    store.graph.changed = true;
  }

  return (
    typeof value.value === 'number'
      ? (
        <Float
        value={value.value}
        onChange={handleChange}
      />   
      )
      : null
  )
}

export default SimpleFloat;
