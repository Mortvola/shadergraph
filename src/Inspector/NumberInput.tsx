import React from 'react';

type PropsType = {
  value: number,
  onChange?: (value: number) => void,
}

const NumberInput: React.FC<PropsType> = ({
  value,
  onChange,
}) => {
  const [stringValue, setStringValue] = React.useState<string>(value.toString())

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setStringValue(event.target.value)

    const newValue = parseFloat(event.target.value);

    if (onChange && !isNaN(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <input type="text" value={stringValue} onChange={handleChange} />
  )
}

export default NumberInput;
