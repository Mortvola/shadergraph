import React from 'react';
import styles from './ContextMenu.module.scss';
import { MenuItemLike } from './MenuItems';
import Menu from './Menu';
import { useStores } from '../State/store';
import { runInAction } from 'mobx';
import { createPortal } from 'react-dom';

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

  return (
    createPortal(
      <div ref={ref} className={styles.wrapper} onClick={onClose} onMouseMove={handleMouseMove}>
        <Menu wrapperRef={ref} menuItems={menuItems} x={x} y={y} onClose={onClose} />
      </div>,
      document.body,
    )
  )
}

export default ContextMenu;
