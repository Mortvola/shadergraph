import React from 'react';
import styles from './SidebarList.module.scss';

type PropsType = {
  title: string,
  addButton: JSX.Element,
  children: React.ReactNode,
}

const SidebarList: React.FC<PropsType> = ({
  title,
  addButton,
  children,
}) => (
  <div className={styles.container}>
    <div className={styles.title}>
      <div>{title}</div>
      {addButton}
    </div>
    <div className={styles.list}>
      { children }
    </div>
  </div>
)

export default SidebarList;
