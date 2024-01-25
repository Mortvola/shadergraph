import React from 'react';
import styles from './Tabs.module.scss';

type PropsType = {
  tabKey: string,
  currentKey: string,
  children: React.ReactNode,
}

const TabPane: React.FC<PropsType> = ({
  tabKey,
  currentKey,
  children,
}) => (
  <div className={styles.pane} hidden={tabKey !== currentKey}>
    { children }
  </div>
)

export default TabPane;
