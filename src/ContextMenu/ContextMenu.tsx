import React from 'react';
import styles from './ContextMenu.module.scss';
import { menuItems } from './MenuItems';
import MenuItem from './MenuItem';

type PropsType = {
  x: number,
  y: number,
  onClose: () => void,
}

const ContextMenu: React.FC<PropsType> = ({
  x,
  y,
  onClose,
}) => (
  <div className={styles.wrapper} onClick={onClose}>
    <div className={styles.contextmenu} style={{ left: x, top: y }}>
      {
        menuItems.map((m) => (
          <MenuItem key={m.name} item={m} x={x} y={y} />
        ))
      }
    </div>
  </div>
)

export default ContextMenu;
