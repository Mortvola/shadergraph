import React from 'react';
import styles from './ContextMenu.module.scss';
import SubmenuItem from './SubmenuItem';
import MenuItem from './MenuItem';
import type { MenuItemLike, MenuItemRecord} from './types';
import { isMenuActionRecord, isSubmenuItem } from './types';

type PropsType = {
  menuItems: () => MenuItemLike[],
  x: number,
  y: number,
  originPosition: [number, number],
  onClose: () => void,
  wrapperRef: React.RefObject<HTMLDivElement>
}

const Menu: React.FC<PropsType> = ({
  menuItems,
  x,
  y,
  originPosition,
  onClose,
  wrapperRef,
}) => {
  const renderMenuItem = (menuItem: MenuItemRecord) => {
    if (isMenuActionRecord(menuItem)) {
      return (
        <MenuItem key={menuItem.name} item={menuItem} originPosition={originPosition} />
      )
    }

    if (isSubmenuItem(menuItem) && menuItem.submenu().length > 0) {
      return (
        <SubmenuItem
          key={menuItem.name}
          wrapperRef={wrapperRef}
          menuItem={menuItem}
          x={x}
          originPosition={originPosition}
          onClose={onClose}
        />
      )
    }

    return null;
  }

  const ref = React.useRef<HTMLDivElement>(null);

  const [offset, setOffset] = React.useState<{ x: number, y: number, scroll: boolean, visible: boolean }>(
    { x: 0, y: 0, scroll: false, visible: false },
  );

  React.useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const menuElement = ref.current;

    if (wrapperElement && menuElement) {
      const wrapperRect = wrapperElement.getBoundingClientRect();
      const menuRect = menuElement.getBoundingClientRect();

      const menuHeight = menuRect.bottom - menuRect.top;

      let newOffset: { x: number, y: number, scroll?: boolean } = { x: 0, y: 0 }

      // If the menu will be outside the bottom of the wrapper then make adjustments.
      if (y + menuHeight > wrapperRect.bottom) {
        const adjustment = y + menuHeight - wrapperRect.bottom;

        // If the adjustment would place the top of the menu
        // above the wrapper then set the top at the top of the wrapper.
        if (y - adjustment < 0) {
          newOffset = { ...newOffset, y: -y, scroll: false }
        }
        else {
          newOffset = { ...newOffset, y: -adjustment, scroll: false }
        }
      }

      const menuWidth = menuRect.right - menuRect.left;

      // If the menu will be outside the bottom of the wrapper then make adjustments.
      if (x + menuWidth > wrapperRect.right) {
        const adjustment = x + menuWidth - wrapperRect.right;

        if (x - adjustment < 0) {
          newOffset = {...newOffset, x: -x }
        }
        else {
          newOffset = {...newOffset, x: -adjustment}
        }
      }

      setOffset((prev) => ({ ...prev, ...newOffset, visible: true }))
    }
  }, [wrapperRef, y])

  return (
    <div
      ref={ref}
      className={styles.contextmenu}
      style={{ left: x + offset.x, top: y + offset.y, visibility: offset.visible ? 'visible' : 'hidden' }}
    >
      <div>
        {
          menuItems().map((m) => (
            renderMenuItem(m)
          ))
        }
      </div>
    </div>
  )
}

export default Menu;
