import React from 'react';
import Float from '../Float';
import { GraphInterface } from '../../State/types';
import { ValueInterface } from '../../Renderer/ShaderBuilder/Types';

type PropsType = {
  graph: GraphInterface,
  value: ValueInterface,
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
