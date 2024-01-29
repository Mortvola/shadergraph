import React from 'react';
import styles from './ObjectList.module.scss';
import SidebarListEntry from './SidebarListEntry';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import Http from '../Http/src';
import { GameObjectInterface } from '../State/types';

type PropsType = {
  object: GameObjectInterface,
  onSelect: (id: number) => void,
  onDelete: (id: number) => void,
  selected: boolean,
}

const ObjectListEntry: React.FC<PropsType> = observer(({
  object,
  onSelect,
  onDelete,
  selected,
}) => {
  const handleDragStart = () => {

  }

  const handleDrag = () => {

  }

  const handleDragEnd = () => {

  }

  const handleNameChange = async (name: string) => {
    const response = await Http.patch(`/game-objects/${object.id}`, { name });

    if (response.ok) {
      runInAction(() => {
        object.name = name;
      })  
    }
  }

  return (
    <SidebarListEntry
      entity={object}
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
        { object.name }
      </div>
    </SidebarListEntry>
  )
})

export default ObjectListEntry;
