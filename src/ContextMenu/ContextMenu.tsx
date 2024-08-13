import React from 'react';
import styles from './ContextMenu.module.scss';
import Menu from './Menu';
import { createPortal } from 'react-dom';
import { MenuItemLike } from './types';

type PropsType = {
  menuItems: () => MenuItemLike[],
  x: number,
  y: number,
  onClose: () => void,
}

const ContextMenu: React.FC<PropsType> = ({
  menuItems,
  x,
  y,
  onClose,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] = React.useState<{ x: number, y: number }>({ x, y })

  const handleContextMenu: React.MouseEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    setMenuPosition({ x: event.clientX, y: event.clientY })
  }

  return (
    createPortal(
      <div
        ref={ref}
        className={styles.wrapper}
        onClick={onClose}
        onContextMenu={handleContextMenu}
      >
        <Menu
          wrapperRef={ref}
          menuItems={menuItems}
          x={menuPosition.x}
          y={menuPosition.y}
          originPosition={[menuPosition.x, menuPosition.y]}
          onClose={onClose}
        />
      </div>,
      document.body,
    )
  )
}

export default ContextMenu;
