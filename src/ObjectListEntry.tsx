import React from 'react';
import styles from './ObjectList.module.scss';
import SidebarListEntry from './SidebarListEntry';
import { GameObjectRecord } from './State/types';

type PropsType = {
  object: GameObjectRecord,
  onSelect: (selection: GameObjectRecord) => void,
  onDelete: (id: number) => void,
  selected: boolean,
}

const ObjectListEntry: React.FC<PropsType> = ({
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

  const handleClick = () => {
    onSelect(object);
  }

  return (
    <SidebarListEntry id={object.id} onDelete={onDelete}>
      <div
        className={`${styles.entry} ${selected ? styles.selected : ''}`}
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        draggable
      >
        {object.name}
      </div>
    </SidebarListEntry>
  )
}

export default ObjectListEntry;
