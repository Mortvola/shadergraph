import React from 'react';
import { runInAction } from 'mobx';
import { ValueType } from '../Renderer/ShaderBuilder/Types';
import { GraphInterface } from '../State/types';

type PropsType = {
  graph: GraphInterface,
  node: { value: ValueType },
}

const PropertyString: React.FC<PropsType> = ({
  graph,
  node,
}) => {
  const [value, setValue] = React.useState<string>((node.value as string));

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
    
    runInAction(() => {
      node.value = event.target.value;
      graph.changed = true;
    })
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

  return (
    <div onClick={handleClick}  onPointerDown={handlePointerDown} onKeyDown={handleKeyDown}>
      <input value={value} onChange={handleChange} />
    </div>
  )
}

export default PropertyString;
