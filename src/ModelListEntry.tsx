import React from 'react';
import { ModelRecord } from './State/types';
import SidebarListEntry from './SidebarListEntry';

type PropsType = {
  model: ModelRecord,
  onDelete: (id: number) => void,
  onSelect: (id: number) => void,
  selected?: boolean,
}

const ModelListEntry: React.FC<PropsType> = ({
  model,
  onDelete,
  onSelect,
  selected = false,
}) => (
  <SidebarListEntry id={model.id} onDelete={onDelete} selected={selected} onSelect={onSelect}>
    <div key={model.id}>{model.name}</div>
  </SidebarListEntry>
)


export default ModelListEntry;
