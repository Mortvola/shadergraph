import React from 'react';
import styles from './MaterialList.module.scss';
import { MaterialInterface } from './State/types';
import SidebarListEntry from './SidebarListEntry';
import { runInAction } from 'mobx';
import Http from './Http/src';
import { observer } from 'mobx-react-lite';

type PropsType = {
  material: MaterialInterface,
  onSelect: (id: number) => void,
  onDelete: (id: number) => void,
  selected: boolean,
}

const MaterialListEntry: React.FC<PropsType> = observer(({
  material,
  onSelect,
  onDelete,
  selected,
}) => {
  const handleDragStart: React.DragEventHandler = (event) => {
    event.dataTransfer.clearData();
    event.dataTransfer.setData("application/material", material.id.toString());
  }

  const handleDrag = () => {

  }

  const handleDragEnd = () => {

  }

  const handleNameChange = async (name: string) => {
    const response = await Http.patch(`/materials/${material.id}`, { name });

    if (response.ok) {
      runInAction(() => {
        material.name = name;
      })  
    }
  }

  return (
    <SidebarListEntry
      entity={material}
      onDelete={onDelete}
      selected={selected}
      onSelect={onSelect}
      onChange={handleNameChange}
    >
      <div
        className={styles.entry}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        draggable
      >
        {material.name}
      </div>
    </SidebarListEntry>
  )
})

export default MaterialListEntry;
