import React from 'react';
import styles from './Toolbar.module.scss';

type PropsType = {
  children: React.ReactNode,
}

const Toolbar: React.FC<PropsType> = ({
  children,
}) => (
  <div className={styles.toolbar}>
    { children }
  </div>
)

export default Toolbar;
