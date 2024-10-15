import React from 'react';
import Float from '../Float';
import type { ValueInterface } from '../../Renderer/ShaderBuilder/Types';
import type { GraphInterface } from '../../State/GraphInterface';

type PropsType = {
  graph: GraphInterface,
  value: ValueInterface,
  onChange: () => void,
}

const SimpleFloat: React.FC<PropsType> = ({
  graph,
  value,
  onChange,
}) => {
  const handleChange = (newValue: number, index?: number) => {
    value.value = newValue;
    graph.changed = true;

    onChange();
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
