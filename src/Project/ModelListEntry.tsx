import React from 'react';
import { ModelInterface } from '../State/types';
import SidebarListEntry from './SidebarListEntry';
import { runInAction } from 'mobx';
import Http from '../Http/src';
import { observer } from 'mobx-react-lite';

type PropsType = {
  model: ModelInterface,
  onDelete: (id: number) => void,
  onSelect: (id: number) => void,
  selected?: boolean,
}

const ModelListEntry: React.FC<PropsType> = observer(({
  model,
  onDelete,
  onSelect,
  selected = false,
}) => {
  const handleNameChange = async (name: string) => {
    const response = await Http.patch(`/models/${model.id}`, { name });

    if (response.ok) {
      runInAction(() => {
        model.name = name;
      })  
    }
  }

  return (
    <SidebarListEntry
      entity={model}
      onDelete={onDelete}
      selected={selected}
      onSelect={onSelect}
      onChange={handleNameChange}
    >
      <div key={model.id}>{model.name}</div>
    </SidebarListEntry>
  )
})

export default ModelListEntry;
