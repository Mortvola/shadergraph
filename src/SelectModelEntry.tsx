import React from 'react';

type PropsType = {
  model: { id: number, name: string },
  onSelection: (selection: { id: number, name: string }) => void,
}

const SelectModelEntry: React.FC<PropsType> = ({
  model,
  onSelection,
}) => {
  const handleClick = () => {
    onSelection({ id: model.id, name: model.name })
  }
 
  return (
    <div onClick={handleClick}>{model.name}</div>
  )
}

export default SelectModelEntry;
