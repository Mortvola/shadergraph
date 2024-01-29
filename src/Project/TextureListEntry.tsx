import React from 'react';
import SidebarListEntry from './SidebarListEntry';
import { TextureInterface } from '../State/types';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import Http from '../Http/src';

type PropsType = {
  texture: TextureInterface,
  onSelect: (id: number) => void,
  onDelete: (id: number) => void,
  selected: boolean,
}

const TextureListEntry: React.FC<PropsType> = observer(({
  texture,
  onSelect,
  onDelete,
  selected,
}) => {
  const handleNameChange = async (name: string) => {
    const response = await Http.patch(`/textures/${texture.id}`, { name });

    if (response.ok) {
      runInAction(() => {
        texture.name = name;
      })  
    }
  }

  return (
    <SidebarListEntry
      entity={texture}
      onDelete={onDelete}
      selected={selected}
      onSelect={onSelect}
      onChange={handleNameChange}
    >
      <div>{texture.name}</div>
    </SidebarListEntry>
  )
})

export default TextureListEntry;
