import React from 'react';

type PropsType = {
  value: number,
  index?: number,
  label?: string,
  onChange: (value: number, index?: number) => void,
  style?: React.CSSProperties,
}

const Float: React.FC<PropsType> = ({
  value,
  index,
  label,
  onChange,
  style,
}) => {
  const [value0, setValue0] = React.useState<string>(value.toString());

  const handleValue0Change: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue0(event.target.value);
    const v = parseFloat(event.target.value);

    if (!isNaN(v)) {
      onChange(v, index)
    }

    event.stopPropagation();
  }

  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
    // graph.selectNode(node)
  }

  const handlePointerDown: React.PointerEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
  }

  return (
    <>
        {label}
        <input style={style} value={value0} onChange={handleValue0Change}  onClick={handleClick}  onPointerDown={handlePointerDown} onKeyDown={handleKeyDown}/>
    </>
  )
}

export default Float;
