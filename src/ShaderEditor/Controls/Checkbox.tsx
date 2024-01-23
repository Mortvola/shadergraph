import React from 'react';

type PropsType = {
  value: boolean,
  label: string,
  onChange: (value: boolean) => void,
}

const Checkbox: React.FC<PropsType> = ({
  value,
  label,
  onChange,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.checked)
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  return (
    <label>
    <input
      type="checkbox"
      checked={value}
      onChange={handleChange}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
    />
    { label }
  </label>
  )
}

export default Checkbox;