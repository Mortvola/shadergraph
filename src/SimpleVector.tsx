import React from 'react';
import Float from './Float';

type PropsType = {
  value: number[],
  length: number,
}

const SimpleVector: React.FC<PropsType> = ({
  value,
  length,
}) => {
  const handleChange = (newValue: number, index?: number) => {
    if (index !== undefined) {
      value[index] = newValue;      
    }
  }

  return (
    <>
      {
        value.slice(0, length).map((v, index) => (
          <Float
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
