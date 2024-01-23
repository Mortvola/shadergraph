import React from 'react';

type PropsType = {
  item: { id: number, name: string},
  onEdit: (id: number) => void,
}

const ShaderListEntry: React.FC<PropsType> = ({
  item,
  onEdit,
}) => {
  const handleEditShader = () => {
    onEdit(item.id)
  }

  return (
    <div onDoubleClick={handleEditShader}>{item.name}</div>
  )
}

export default ShaderListEntry;
