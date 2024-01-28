import React from 'react';
import styles from './SidebarList.module.scss';

type PropsType = {
  id: number,
  onDelete: (id: number) => void,
  onSelect?: (id: number) => void,
  children: React.ReactNode,
  selected?: boolean,
}

const SidebarListEntry: React.FC<PropsType> = ({
  id,
  onDelete,
  onSelect,
  children,
  selected = false,
}) => {
  const handleDelete = () => {
    onDelete(id)
  }

  const handleClick = () => {
    if (onSelect) {
      onSelect(id)
    }
  }

  return (
    <div className={`${styles.entry} ${selected ? styles.selected : ''}`} onClick={handleClick}>
      {children}
      <button type="button" onClick={handleDelete}>X</button>
    </div>
  )
}

export default SidebarListEntry;
