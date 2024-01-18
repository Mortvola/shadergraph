import React from 'react';
import styles from './ContextMenu.module.scss';
import { MenuItemLike, MenuItemRecord, isMenuActionRecord, isSubmenuItem } from './MenuItems';
import SubmenuItem from './SubmenuItem';
import MenuItem from './MenuItem';
import { runInAction } from 'mobx';
import { useStores } from '../State/store';

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

  return (
    <div ref={ref} className={styles.contextmenu} style={{ left: x, top: y }}>
      {
        menuItems().map((m) => (
          renderMenuItem(m)
        ))
      }
    </div>
  )
}

export default Menu;
