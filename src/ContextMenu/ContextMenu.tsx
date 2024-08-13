import React from 'react';
import styles from './ContextMenu.module.scss';
import Menu from './Menu';
import { useStores } from '../State/store';
import { runInAction } from 'mobx';
import { createPortal } from 'react-dom';
import { MenuItemLike } from './types';

type PropsType = {
  menuItems: () => MenuItemLike[],
  x: number,
  y: number,
  onClose: () => void,
}

const isInRect = (x: number, y: number, rect: DOMRect) => {
  return (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom);
}

const ContextMenu: React.FC<PropsType> = ({
  menuItems,
  x,
  y,
  onClose,
}) => {
  const store = useStores();

  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLElement> = (event) => {
    for (let i = store.menus.length - 1; i >= 0; i -= 1) {
      const itemRect = store.menus[i].menuItem.getBoundingClientRect();

      if (!isInRect(event.clientX, event.clientY, itemRect) && !isInRect(event.clientX, event.clientY, store.menus[i].menuRect)) {
        runInAction(() => {
          store.menus = [
            ...store.menus.slice(0, i)
          ]  
        })
      }
      else {
        break;
      }
    }
  }

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
        onMouseMove={handleMouseMove}
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
