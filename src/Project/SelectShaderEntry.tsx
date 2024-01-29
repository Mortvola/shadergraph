import React from 'react';

type PropsType = {
  shader: { id: number, name: string },
  onSelection: ( id: number) => void,
}

const SelectShaderEntry: React.FC<PropsType> = ({
  shader,
  onSelection,
}) => {
  const handleClick = () => {
    onSelection(shader.id)
  }
 
  return (
    <div onClick={handleClick}>{shader.name}</div>
  )
}

export default SelectShaderEntry;
