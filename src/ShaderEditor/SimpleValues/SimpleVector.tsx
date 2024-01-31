import React from 'react';
import Float from '../Float';
import { useStores } from '../../State/store';

type PropsType = {
  value: number[],
  length: number,
}

const SimpleVector: React.FC<PropsType> = ({
  value,
  length,
}) => {
  const store = useStores();

  const handleChange = (newValue: number, index?: number) => {
    if (index !== undefined) {
      value[index] = newValue;
      
      store.applyMaterial();
    }
  }

  return (
    <>
      {
        value.slice(0, length).map((v, index) => (
          <Float
            key={index}
            value={value[index]}
            onChange={handleChange}
            index={index}
          /> 
        ))
      }
    </>
  )
}

export default SimpleVector;
