import React from 'react';
import SidebarListEntry from './SidebarListEntry';

type PropsType = {
  item: { id: number, name: string},
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
}

const ShaderListEntry: React.FC<PropsType> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const handleEditShader = () => {
    onEdit(item.id)
  }

  return (
    <SidebarListEntry id={item.id} onDelete={onDelete}>
      <div onDoubleClick={handleEditShader}>{item.name}</div>
    </SidebarListEntry>
  )
}

export default ShaderListEntry;
