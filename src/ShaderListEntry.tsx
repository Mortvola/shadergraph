import React from 'react';
import SidebarListEntry from './SidebarListEntry';

type PropsType = {
  item: { id: number, name: string},
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
  onSelect: (id: number) => void,
  selected?: boolean,
}

const ShaderListEntry: React.FC<PropsType> = ({
  item,
  onEdit,
  onDelete,
  onSelect,
  selected = false,
}) => {
  const handleEditShader = () => {
    onEdit(item.id)
  }

  return (
    <SidebarListEntry id={item.id} onDelete={onDelete} selected={selected} onSelect={onSelect}>
      <div onDoubleClick={handleEditShader}>{item.name}</div>
    </SidebarListEntry>
  )
}

export default ShaderListEntry;
