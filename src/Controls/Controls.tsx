import React from 'react';
import Draggable from '../Draggable';
import styles from './Controls.module.scss';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import { CullMode } from '../State/types';
import Checkbox from './Checkbox';

const Controls: React.FC = observer(() => {
  const { graph } = useStores();

  if (!graph) {
    return null;
  }

  type SizeInfo = { x: number, y: number };

  const [position, setPosition] = React.useState<SizeInfo>({ x: 100, y: 100 });

  const handleMove = (x: number, y: number) => {
    setPosition((prev) => ({ x, y }));
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

  const handleCullChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    console.log(event.target.value)
    graph?.setCullMode(event.target.value as CullMode)
  }

  return (
    <Draggable onMove={handleMove} position={position} >
      <div className={styles.wrapper}  onClick={handleClick}>
        <div>Controls</div>
        <div className={styles.controls}>
          <Checkbox value={graph.transparent} label="Transparent" onChange={graph.setTransparency} />
          <Checkbox value={graph.depthWriteEnabled} label="Depth Write Enabled" onChange={graph.setDepthWriteEnabled} />
          <Checkbox value={graph.lit} label="Lit" onChange={graph.setLit} />
          <label>
            Cull Mode
            <select value={graph.cullMode} onChange={handleCullChange}>
              <option value="none">None</option>
              <option value="back">Back</option>
              <option value="front">Front</option>
            </select>
          </label>
        </div>
      </div>
    </Draggable>
  )
})

export default Controls;
