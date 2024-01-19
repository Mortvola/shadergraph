import React from 'react';
import { useStores } from './State/store';
import { ValueType } from './shaders/ShaderBuilder/Types';
import { runInAction } from 'mobx';

type PropTypes = {
  node: { value: ValueType },
}

const PropertyString: React.FC<PropTypes> = ({
  node,
}) => {
  const { graph } = useStores();
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
