import React from 'react';
import Draggable from '../Draggable';
import styles from './Controls.module.scss';
import { useStores } from '../../State/store';
import { observer } from 'mobx-react-lite';
import Checkbox from './Checkbox';

const Controls: React.FC = observer(() => {
  const { graph } = useStores();

  if (!graph) {
    return null;
  }

  type SizeInfo = { x: number, y: number };

  const [position, setPosition] = React.useState<SizeInfo>({ x: 100, y: 100 });

  const handlePositionChange = (deltaX: number, deltaY: number) => {
    setPosition((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
  }

  React.useEffect(() => {
    const positionItem = localStorage.getItem('controls')

    if (positionItem) {
      const pos = JSON.parse(positionItem);
      setPosition(pos);
    }

  }, []);

  React.useEffect(() => {
    const timer  = setInterval(() => {
      localStorage.setItem('controls', JSON.stringify(position))
    }, 5000)

    return () => {
      clearInterval(timer);
    }
  }, [position]);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  return (
    <Draggable onPositionChange={handlePositionChange} position={position} >
      <div className={styles.wrapper}  onClick={handleClick}>
        <div>Controls</div>
        <div className={styles.controls}>
        </div>
      </div>
    </Draggable>
  )
})

export default Controls;
