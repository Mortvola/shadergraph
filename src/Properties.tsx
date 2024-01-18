import { observer } from 'mobx-react-lite';
import React from 'react';
import Draggable from './Draggable';
import styles from './Properties.module.scss';
import { useStores } from './State/store';
import ContextMenu from './PropertyMenu/ContextMenu'
import PropertyEntry from './PropertyEntry';
import { PropertyInterface } from './shaders/ShaderBuilder/Types';
import PropertyDialog from './PropertyDialog';

const Properties: React.FC = observer(() => {
  const { graph } = useStores();

  type SizeInfo = { x: number, y: number };
  const [position, setPosition] = React.useState<SizeInfo>({ x: 100, y: 100 });

  const handleMove = (x: number, y: number) => {
    setPosition((prev) => ({ x, y }));
  }

  React.useEffect(() => {
    const positionItem = localStorage.getItem('properties')

    if (positionItem) {
      const pos = JSON.parse(positionItem);
      setPosition(pos);
    }
  }, []);

  React.useEffect(() => {
    const timer  = setInterval(() => {
      localStorage.setItem('properties', JSON.stringify(position))
    }, 5000)

    return () => {
      clearInterval(timer);
    }
  }, [position]);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  // const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
  //   event.stopPropagation();
  // }

  // const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
  //   event.stopPropagation();
  // }

  const [showMenu, setShowMenu] = React.useState<[number, number] | null>(null);

  const handleMenuClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    setShowMenu([event.clientX, event.clientY]);
  }

  const handleMenuClose = () => {
    setShowMenu(null);
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const [showDialog, setShowDialog] = React.useState<{ property: PropertyInterface, x: number, y: number} | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleEdit = (property: PropertyInterface, x: number, y: number) => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setShowDialog({ property, x: rect.right, y });
    }
  }

  const handleHideDialog = () => {
    setShowDialog(null);
  }

  return (
    <Draggable onMove={handleMove} position={position} >
      <div ref={ref} className={styles.wrapper}  onClick={handleClick}>
        <div className={styles.title}>
          <div>
            Properties
          </div>
          <div
            onClick={handleMenuClick}
            onPointerDown={handlePointerDown}
          >
            +
          </div>
        </div>
        <div className={styles.properties}>
          {
            graph.properties.map((p) => (
              <PropertyEntry key={p.name} property={p} onEdit={handleEdit} />
            ))
          }
        </div>
      </div>
        {
          showMenu
            ? <ContextMenu x={showMenu[0]} y={showMenu[1]} onClose={handleMenuClose} />
            : null
        }
        {
          showDialog
            ? <PropertyDialog onHide={handleHideDialog} property={showDialog.property} x={showDialog.x} y={showDialog.y} />
            : null
        }
    </Draggable>
  )
})

export default Properties;
