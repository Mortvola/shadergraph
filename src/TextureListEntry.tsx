import React from 'react';
import SidebarListEntry from './SidebarListEntry';
import { TextureRecord } from './State/types';

type PropsType = {
  texture: TextureRecord,
  onSelect: (id: number) => void,
  onDelete: (id: number) => void,
  selected: boolean,
}

const TextureListEntry: React.FC<PropsType> = ({
  texture,
  onSelect,
  onDelete,
  selected,
}) => (
  <SidebarListEntry id={texture.id} onDelete={onDelete} selected={selected} onSelect={onSelect}>
    <div>{texture.name}</div>
  </SidebarListEntry>
)

export default TextureListEntry;
