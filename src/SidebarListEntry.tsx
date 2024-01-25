import React from 'react';
import styles from './SidebarList.module.scss';

type PropsType = {
  id: number,
  onDelete: (id: number) => void,
  children: React.ReactNode,
}

const SidebarListEntry: React.FC<PropsType> = ({
  id,
  onDelete,
  children,
}) => {
  const handleDelete = () => {
    onDelete(id)
  }

  return (
    <div className={styles.entry}>
      {children}
      <button type="button" onClick={handleDelete}>X</button>
    </div>
  )
}

export default SidebarListEntry;
