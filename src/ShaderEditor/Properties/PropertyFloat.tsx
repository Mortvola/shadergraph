import React from 'react';
import styles from './Properties.module.scss'
import { ValueType } from '../../Renderer/ShaderBuilder/GraphDescriptor';

type PropsType = {
  node: { value: ValueType },
  onChange: (value: number) => void,
}

const PropertyFloat: React.FC<PropsType> = ({
  node,
  onChange,
}) => {
  const [value, setValue] = React.useState<string>((node.value as string));

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
    const v = parseFloat(event.target.value);

    if (!isNaN(v)) {
      onChange(v);
    }
  }

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  return (
    <div onClick={handleClick} onPointerDown={handlePointerDown} onKeyDown={handleKeyDown}>
      <input className={styles.float} value={value} onChange={handleChange} />
    </div>
  )
}

export default PropertyFloat;
