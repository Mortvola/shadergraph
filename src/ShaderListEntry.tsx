import React from 'react';
import SidebarListEntry from './SidebarListEntry';
import Http from './Http/src';
import { ShaderInterface } from './State/types';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';

type PropsType = {
  item: ShaderInterface,
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
  onSelect: (id: number) => void,
  selected?: boolean,
}

const ShaderListEntry: React.FC<PropsType> = observer(({
  item,
  onEdit,
  onDelete,
  onSelect,
  selected = false,
}) => {
  const handleEditShader = () => {
    onEdit(item.id)
  }

  const handleNameChange = async (name: string) => {
    const response = await Http.patch(`/shader-descriptors/${item.id}`, { name });

    if (response.ok) {
      runInAction(() => {
        item.name = name;
      })  
    }
  }

  return (
    <SidebarListEntry
      entity={item}
      onDelete={onDelete}
      selected={selected}
      onSelect={onSelect}
      onChange={handleNameChange}
    >
      <div onDoubleClick={handleEditShader}>{item.name}</div>
    </SidebarListEntry>
  )
})

export default ShaderListEntry;
