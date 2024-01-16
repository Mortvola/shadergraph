import React from 'react';
import Canvas3d from './Canvas3d';
import styles from './Preview.module.scss';
import Draggable from './Draggable';

const Preview: React.FC = () => {
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: 100, y: 100});

  const handleMove = (x: number, y: number) => {
    setPosition({ x, y });
  }

  return (
    <Draggable onMove={handleMove} position={position}>
      <div className={styles.preview}>
        <div>Preview</div>
        <Canvas3d />
      </div>
    </Draggable>
  )
}

export default Preview;

