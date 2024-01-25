import React from 'react';
import styles from './Tabs.module.scss';

type PropsType = {
  children: React.ReactNode,
}

const Tabs: React.FC<PropsType> = ({
  children,
}) => (
  <div className={styles.tabs}>
    { children}
  </div>
)

export default Tabs;
