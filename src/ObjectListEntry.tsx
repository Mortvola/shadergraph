import React from 'react';
import styles from './ObjectList.module.scss';

type PropsType = {
  object: { id: number, name: string }
  onSelect: (selection: { id: number, name: string }) => void,
  selected: boolean,
}

const ObjectListEntry: React.FC<PropsType> = ({
  object,
  onSelect,
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
  )
}

export default ObjectListEntry;
