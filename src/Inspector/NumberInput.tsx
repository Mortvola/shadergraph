import React from 'react';
import styles from './NumberInput.module.scss';

type PropsType = {
  value: number,
  onChange?: (value: number) => void,
  onFocus?: () => void,
  onBlur?: () => void,
}

const NumberInput: React.FC<PropsType> = ({
  value,
  onChange,
  onFocus,
  onBlur,
}) => {
  const [stringValue, setStringValue] = React.useState<string>(value.toString())

  React.useEffect(() => {
    setStringValue(value.toString())
  }, [value])

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setStringValue(event.target.value)

    const newValue = parseFloat(event.target.value);

    if (onChange && !isNaN(newValue)) {
      onChange(newValue)
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation()
  }

  return (
    <input
      type="text"
      className={styles.input}
      value={stringValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

export default NumberInput;
