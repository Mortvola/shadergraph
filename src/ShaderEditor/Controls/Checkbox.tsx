import React from 'react';
import styles from './Checkbox.module.scss'

type PropsType = {
  value: boolean,
  label: React.ReactNode,
  onChange?: (value: boolean) => void,
}

const Checkbox: React.FC<PropsType> = ({
  value,
  label,
  onChange,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (onChange) {
      onChange(event.target.checked)
    }
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleClick: React.MouseEventHandler<HTMLLabelElement> = (event) => {
    event.stopPropagation();
  }

  return (
    <label className={styles.layout} onClick={handleClick}>
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