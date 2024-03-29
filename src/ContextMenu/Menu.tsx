import React from 'react';
import styles from './ContextMenu.module.scss';
import SubmenuItem from './SubmenuItem';
import MenuItem from './MenuItem';
import { runInAction } from 'mobx';
import { useStores } from '../State/store';
import { MenuItemLike, MenuItemRecord, isMenuActionRecord, isSubmenuItem } from './types';

type PropsType = {
  menuItems: () => MenuItemLike[],
  x: number,
  y: number,
  onClose: () => void,
  parentRef?: React.RefObject<HTMLDivElement>,
  wrapperRef: React.RefObject<HTMLDivElement>
}

const Menu: React.FC<PropsType> = ({
  menuItems,
  x,
  y,
  onClose,
  parentRef,
  wrapperRef,
}) => {
  const store = useStores();

  const renderMenuItem = (menuItem: MenuItemRecord) => {
    if (isMenuActionRecord(menuItem)) {
      return (
        <MenuItem key={menuItem.name} item={menuItem} x={x} y={y} />
      )  
    }

    if (isSubmenuItem(menuItem)) {
      return <SubmenuItem key={menuItem.name} wrapperRef={wrapperRef} menuItem={menuItem} x={x} onClose={onClose} />
    }

    return null;
  }

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    const parentElement = parentRef?.current;

    if (parentElement && element) {
      const rect = element.getBoundingClientRect();

      runInAction(() => {
        store.menus = [
          ...store.menus,
          { menuItem: parentElement, menuRect: rect }
        ]  
      })
    }
  }, [parentRef, store])

  const [yOffset, setYOffset] = React.useState<{ offset: number, scroll: boolean, visible: boolean }>(
    { offset: 0, scroll: false, visible: false },
  );

  React.useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const menuElement = ref.current;

    if (wrapperElement && menuElement) {
      const wrapperRect = wrapperElement.getBoundingClientRect();
      const menuRect = menuElement.getBoundingClientRect();

      const height = menuRect.bottom - menuRect.top;

      if (y + height > wrapperRect.bottom) {
        if (y - height < 0) {
          setYOffset({ offset: -y, scroll: false, visible: true });
        }
        else {
          setYOffset({ offset: -height, scroll: false, visible: true });
        }
      }
      else {
        setYOffset((prev) => ({ ...prev, visible: true }))
      }
    }
  }, [wrapperRef, y])

  return (
    <div ref={ref} className={styles.contextmenu} style={{ left: x, top: y + yOffset.offset, visibility: yOffset.visible ? 'visible' : 'hidden' }}>
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
