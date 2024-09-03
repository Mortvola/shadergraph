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

  const [yOffset, setYOffset] = React.useState<{ offset: number, scroll: boolean, visible: boolean }>(
    { offset: 0, scroll: false, visible: false },
  );

  React.useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const menuElement = ref.current;

    if (wrapperElement && menuElement) {
      const wrapperRect = wrapperElement.getBoundingClientRect();
      const menuRect = menuElement.getBoundingClientRect();

      const menuHeight = menuRect.bottom - menuRect.top;

      if (y + menuHeight > wrapperRect.bottom) {
        const adjustment = y + menuHeight - wrapperRect.bottom;
        
        // If the adjustment would place the top of the menu
        // above the wrapper then set the top at the top of the wrapper.
        if (y - adjustment < 0) {
          setYOffset({ offset: -y, scroll: false, visible: true });
        }
        else {
          setYOffset({ offset: -adjustment, scroll: false, visible: true });
        }
      }
      else {
        setYOffset((prev) => ({ ...prev, offset: 0, visible: true }))
      }
    }
  }, [wrapperRef, y])

  return (
    <div
      ref={ref}
      className={styles.contextmenu}
      style={{ left: x, top: y + yOffset.offset, visibility: yOffset.visible ? 'visible' : 'hidden' }}
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
