import React from 'react';
import { ValueType } from '../Renderer/ShaderBuilder/Types';

type PropsType = {
  node: { value: ValueType },
  onChange: (value: string) => void,
}

const PropertyString: React.FC<PropsType> = ({
  node,
  onChange,
}) => {
  const [value, setValue] = React.useState<string>((node.value as string));

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
    onChange(event.target.value);
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
    <div onClick={handleClick}  onPointerDown={handlePointerDown} onKeyDown={handleKeyDown}>
      <input value={value} onChange={handleChange} />
    </div>
  )
}

export default PropertyString;
