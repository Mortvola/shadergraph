import React from 'react';
import styles from './Properties.module.scss'
import ColorPicker from '../../Color/ColorPicker';
import type { ValueType } from '../../Renderer/ShaderBuilder/GraphDescriptor';

type PropsType = {
  value: ValueType,
  onChange: (color: number[]) => void,
}

const PropertyColor: React.FC<PropsType> = ({
  value,
  onChange,
}) => {
  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  return (
    <div className={styles.vector} onClick={handleClick} onPointerDown={handlePointerDown} onKeyDown={handleKeyDown}>
      {
        Array.isArray(value)
          ? <ColorPicker value={value} onChange={onChange} useAlpha useHdr />
          : null
      }
    </div>
  )
}

export default PropertyColor;
