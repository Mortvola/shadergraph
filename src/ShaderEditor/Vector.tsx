import React from 'react';
import { ValueType } from '../Renderer/ShaderBuilder/Types';
import styles from './Node.module.scss';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import Float from './Float';
import { GraphInterface } from '../State/types';

type PropsType = {
  graph: GraphInterface,
  node: { value: ValueType },
}

const Vector: React.FC<PropsType> = observer(({
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

  if (Array.isArray(node.value)) {
    return (
      <div className={styles.vec2} >
        {
          node.value.map((v, i) => (
            <Float value={v} onChange={handleValue0Change} label={getLabel(i)} index={i} />
          ))
        }
      </div>
    )
  }

  return null;
})

export default Vector;
