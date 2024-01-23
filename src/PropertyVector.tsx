import React from 'react';
import { runInAction } from 'mobx';
import { useStores } from './State/store';
import { ValueType } from './Renderer/ShaderBuilder/Types';
import Float from './Float';
import styles from './Properties.module.scss'
import { GraphInterface } from './State/types';

type PropsType = {
  graph: GraphInterface,
  node: { value: ValueType },
}

const PropertyVector: React.FC<PropsType> = ({
  graph,
  node,
}) => {
  const handleValue0Change = (v: number, index?: number) => {
    runInAction(() => {
      if (Array.isArray(node.value)) {
        node.value[index ?? 0] = v;
        graph.changed = true;
      }
    })  
  }

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
            <Float value={v} onChange={handleValue0Change} label={getLabel(i)} index={i} />
          ))
        }
    </div>
  )
}

export default PropertyVector;
