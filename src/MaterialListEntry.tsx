import React from 'react';
import styles from './MaterialList.module.scss';
import { MaterialRecord } from './State/types';

type PropsType = {
  material: MaterialRecord,
  onSelect: (selection: MaterialRecord) => void,
  selected: boolean,
}

const MaterialListEntry: React.FC<PropsType> = ({
  material,
  onSelect,
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

  const handleClick = () => {
    onSelect(material);
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
      {material.name}
    </div>
  )
}

export default MaterialListEntry;
