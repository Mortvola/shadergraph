import React from 'react';
import Float from '../Float';
import Value from '../../Renderer/ShaderBuilder/Value';
import { GraphInterface } from '../../State/types';

type PropsType = {
  graph: GraphInterface,
  value: Value,
}

const SimpleFloat: React.FC<PropsType> = ({
  graph,
  value,
}) => {
  const handleChange = (newValue: number, index?: number) => {
    value.value = newValue;
    graph.changed = true;
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
