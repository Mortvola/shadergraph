import React from 'react';
import styles from './ColorPicker.module.scss';
import GradientKey from './GradientKey';
import { AlphaGradientKey, ColorGradientKey } from '../Renderer/types';

type PropsType = {
  keys: (AlphaGradientKey | ColorGradientKey)[],
  onKeyClick?: (index: number) => void,
  selected?: number,
  onAddKey?: (position: number) => void,
  onMove?: (id: number, position: number) => void,
}

const GradientKeys: React.FC<PropsType> = ({
  keys,
  onKeyClick,
  selected,
  onAddKey,
  onMove,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>(0);

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setWidth(rect.width)
    }
  }, [])

  const handleKeyClick = (id: number) => {
    if (onKeyClick) {
      onKeyClick(id)
    }
  }

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      if (onAddKey) {
        onAddKey((event.clientX - rect.left) / rect.width)
      }
    }
  }

  const handleMove = (id: number, clientX: number) => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      const position = Math.max(Math.min(1, (clientX - rect.left) / rect.width), 0);

      if (onMove) {
        onMove(id, position)
      }
    }
  }

  return (
    <div ref={ref} className={styles.keys} onClick={handleClick}>
      {
        keys.map((k) => (
          <GradientKey
            key={k.id}
            id={k.id}
            position={k.position * width}
            onClick={handleKeyClick}
            selected={k.id === selected}
            onMove={handleMove}
          />
        ))
      }
    </div>
  )
}

export default GradientKeys;
