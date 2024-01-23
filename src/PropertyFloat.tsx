import React from 'react';
import { runInAction } from 'mobx';
import { ValueType } from './Renderer/ShaderBuilder/Types';
import styles from './Properties.module.scss'
import { GraphInterface } from './State/types';

type PropsType = {
  node: { value: ValueType },
  graph: GraphInterface,
}

const PropertyFloat: React.FC<PropsType> = ({
  node,
  graph,
}) => {
  const [value, setValue] = React.useState<string>((node.value as string));

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
    const v = parseFloat(event.target.value);

    if (!isNaN(v)) {
      runInAction(() => {
        node.value = v;
        graph.changed = true;
      })
    }
  }

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
    <div onClick={handleClick} onPointerDown={handlePointerDown} onKeyDown={handleKeyDown}>
      <input className={styles.float} value={value} onChange={handleChange} />
    </div>
  )
}

export default PropertyFloat;
