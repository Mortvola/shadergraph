import React from 'react';
import Canvas3d from '../Canvas3d';
import styles from './Preview.module.scss';
import Draggable from './Draggable';
import { useStores } from '../State/store';

const Preview: React.FC = () => {
  const { shaderPreview } = useStores();

  type SizeInfo = { x: number, y: number, width: number, height: number };

  const [position, setPosition] = React.useState<SizeInfo>({ x: 100, y: 100, width: 200, height: 200});

  const handleMove = (x: number, y: number) => {
    setPosition((prev) => ({ x, y, width: prev.width, height: prev.height }));
  }

  const handleResize = (x: number, y: number, width: number, height: number) => {
    setPosition({ x, y, width, height });
  }

  React.useEffect(() => {
    const positionItem = localStorage.getItem('preview')

    if (positionItem) {
      const pos = JSON.parse(positionItem);
      setPosition(pos);
    }

  }, []);

  React.useEffect(() => {
    const timer  = setInterval(() => {
      localStorage.setItem('preview', JSON.stringify(position))
    }, 5000)

    return () => {
      clearInterval(timer);
    }
  }, [position]);

  return (
    <Draggable onMove={handleMove} position={position} onResize={handleResize} resizable >
      <div className={styles.preview}>
        <div>Preview</div>
        <Canvas3d renderer={shaderPreview} />
      </div>
    </Draggable>
  )
}

export default Preview;

