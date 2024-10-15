import React from 'react';
import Float from '../Float';
// import { useStores } from '../../State/store';

type PropsType = {
  value: number[],
  length: number,
  onChange: () => void,
}

const SimpleVector: React.FC<PropsType> = ({
  value,
  length,
  onChange,
}) => {
  // const store = useStores();

  const handleChange = (newValue: number, index?: number) => {
    if (index !== undefined) {
      value[index] = newValue;

      // store.applyMaterial();
      onChange()
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
