import React from 'react';
import { runInAction } from 'mobx';
import { ValueType } from '../Renderer/ShaderBuilder/Types';
import { GraphInterface } from '../State/types';
import Http from '../Http/src';

type PropsType = {
  graph: GraphInterface,
  node: { value: ValueType },
}

const PropertyTexture: React.FC<PropsType> = ({
  graph,
  node,
}) => {
  const [value, setValue] = React.useState<string>((node.value as string));

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const id = parseInt(event.target.value, 10);

    setValue(id.toString());
    
    runInAction(() => {
      node.value = id;
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

  const [list, setList] = React.useState<{ id: number, name: string }[]>([]);

  React.useEffect(() => {
    (
      async () => {
        const response = await Http.get<{ id: number, name: string }[]>('/textures-list')

        if (response.ok) {
          const list = await response.body();

          setList(list);
        }
      }
    )()
  }, []);

  return (
    <div onClick={handleClick}  onPointerDown={handlePointerDown} onKeyDown={handleKeyDown}>
      <select value={value} onChange={handleChange}>
        {
          list.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))
        }
      </select>
    </div>
  )
}

export default PropertyTexture;
