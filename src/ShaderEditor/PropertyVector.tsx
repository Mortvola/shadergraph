import React from 'react';
import { ValueType } from '../Renderer/ShaderBuilder/Types';
import Float from './Float';
import styles from './Properties.module.scss'

type PropsType = {
  node: { value: ValueType },
  onChange: (v: number, index?: number) => void,
}

const PropertyVector: React.FC<PropsType> = ({
  node,
  onChange,
}) => {
  const getLabel = (i: number) => (
    i === 3 ? 'W:' : `${String.fromCharCode('X'.charCodeAt(0) + i)}:`
  )

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
          Array.isArray(node.value) && node.value.map((v, i) => (
            <Float key={i} value={v} onChange={onChange} label={getLabel(i)} index={i} />
          ))
        }
    </div>
  )
}

export default PropertyVector;
