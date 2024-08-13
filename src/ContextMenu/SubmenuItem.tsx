import React from 'react';
import styles from './ContextMenu.module.scss';
import Menu from './Menu';
import { createPortal } from 'react-dom';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import { SubmenutItemRecord } from './types';

type PropsType = {
  menuItem: SubmenutItemRecord,
  x: number,
  originPosition: [number, number],
  onClose: () => void,
  wrapperRef: React.RefObject<HTMLDivElement>
}

const SubmenuItem: React.FC<PropsType> = observer(({
  menuItem,
  x,
  originPosition,
  onClose,
  wrapperRef,
}) => {
  const store = useStores();
  const { menus } = store;
  const [showSubmenu, setShowSubmenu] = React.useState<{ x: number, y: number } | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;

    if (element && !menus.some((m) => m.menuItem === element)) {
      setShowSubmenu(null);
    }
  }, [menus]);

  const handleMouseOver = () => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setShowSubmenu({ x: rect.right, y: rect.top });
    }
  }

  const handleClose = () => {
    setShowSubmenu(null);
  }

  return (
    <>
      <div ref={ref} className={styles.submenu} onMouseOver={handleMouseOver}>
        {menuItem.name}
        <div>{'>'}</div>
      </div>
      {
        showSubmenu && wrapperRef.current
        ? createPortal(
            <Menu
              wrapperRef={wrapperRef}
              parentRef={ref}
              menuItems={menuItem.submenu}
              x={showSubmenu.x}
              y={showSubmenu.y}
              originPosition={originPosition}
              onClose={handleClose}
            />,
            wrapperRef.current,
          )
        : null
      }
    </>
  );
})

export default SubmenuItem;
