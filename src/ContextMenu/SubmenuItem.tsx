import React from 'react';
import styles from './ContextMenu.module.scss';
import Menu from './Menu';
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
  const [showSubmenu, setShowSubmenu] = React.useState<{ x: number, y: number } | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseOver = () => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      // y is offset by the amount of padding at top of the menu plus the borde width
      setShowSubmenu({ x: rect.width, y: -9 });
    }
  }

  const handleMouseLeave = () => {
    setShowSubmenu(null);

    console.log(`left ${menuItem.name}`)
  }

  const handleClose = () => {
    setShowSubmenu(null);
  }

  return (
    <>
      <div ref={ref} className={styles.submenu} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
        {menuItem.name}
        <div>{'>'}</div>
        {
          showSubmenu && wrapperRef.current
          ? (
              <Menu
                wrapperRef={wrapperRef}
                menuItems={menuItem.submenu}
                x={showSubmenu.x}
                y={showSubmenu.y}
                originPosition={originPosition}
                onClose={handleClose}
              />
            )
          : null          
        }
      </div>
    </>
  );
})

export default SubmenuItem;
