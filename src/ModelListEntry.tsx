import React from 'react';
import { ModelRecord } from './State/types';
import SidebarListEntry from './SidebarListEntry';

type PropsType = {
  model: ModelRecord,
  onDelete: (id: number) => void,
}

const ModelListEntry: React.FC<PropsType> = ({
  model,
  onDelete,
}) => (
  <SidebarListEntry id={model.id} onDelete={onDelete}>
    <div key={model.id}>{model.name}</div>
  </SidebarListEntry>
)


export default ModelListEntry;
