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
          <MenuItem item={m} x={x} y={y} />
        ))
      }
      {/* <div onClick={handleAddSphereClick}>UV Sphere</div>
      <div onClick={handleAddBoxClick}>Box</div>
      <div onClick={handleAddTetrahedronClick}>Tetrahedon</div>
      <div onClick={handleAddCylinderClick}>Cylinder</div>
      <div onClick={handleAddConeClick}>Cone</div>
      <div onClick={handleAddPlaneClick}>Plane</div>
      <div onClick={handleAddTOrusClick}>Torus</div> */}
    </div>
  </div>
)

export default ContextMenu;
