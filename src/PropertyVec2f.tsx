import React from 'react';
import { PropertyType } from './shaders/ShaderBuilder/Types';
import styles from './Node.module.scss';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { useStores } from './State/store';

type PropsType = {
  node: { value: PropertyType },
}

const PropertyVec2f: React.FC<PropsType> = observer(({
  node,
}) => {
  const { graph } = useStores();
  const [value0, setValue0] = React.useState<string>(((node.value as [number, number])[0] ?? 0).toString());
  const [value1, setValue1] = React.useState<string>(((node.value as [number, number])[1] ?? 0).toString());

  const handleValue0Change: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue0(event.target.value);
    const value = parseFloat(event.target.value);

    if (!isNaN(value)) {
      runInAction(() => {
        if (Array.isArray(node.value)) {
          node.value[0] = parseFloat(event.target.value);
          graph.changed = true;
        }
      })  
    }

    event.stopPropagation();
  }

  const handleValue1Change: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue1(event.target.value);
    const value = parseFloat(event.target.value);

    if (!isNaN(value)) {
      runInAction(() => {
        if (Array.isArray(node.value)) {
          node.value[1] = parseFloat(event.target.value);
          graph.changed = true;
        }
      })
    }

    event.stopPropagation();
  }

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    // graph.selectNode(node)
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  if (Array.isArray(node.value)) {
    return (
      <div className={styles.vec2} onClick={handleClick}  onPointerDown={handlePointerDown} onKeyDown={handleKeyDown} >
        X:
        <input value={value0} onChange={handleValue0Change} />
        Y:
        <input  value={value1} onChange={handleValue1Change} />
      </div>
    )
  }

  return null;
})

export default PropertyVec2f;
