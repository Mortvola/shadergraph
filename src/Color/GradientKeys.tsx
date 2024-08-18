import React from 'react';
import styles from './ColorPicker.module.scss';
import GradientKey from './GradientKey';
import { AlphaGradientKey } from '../Renderer/types';

type PropsType = {
  keys: AlphaGradientKey[],
  onKeyClick?: (index: number) => void,
  selected?: number,
}

const GradientKeys: React.FC<PropsType> = ({
  keys,
  onKeyClick,
  selected,
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

  return (
    <div ref={ref} className={styles.keys}>
      {
        keys.map((k) => (
          <GradientKey
            key={k.id}
            alphaKey={k}
            position={k.position * width}
            onClick={handleKeyClick}
            selected={k.id === selected}
          />
        ))
      }
    </div>
  )
}

export default GradientKeys;
