import React from 'react';
import { ValueType } from '../Renderer/ShaderBuilder/Types';
import Http from '../Http/src';

type PropsType = {
  node: { value: ValueType },
  onChange: (id: number) => void,
}

const PropertyTexture: React.FC<PropsType> = ({
  node,
  onChange,
}) => {
  const [value, setValue] = React.useState<string>((node.value as string));

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const id = parseInt(event.target.value, 10);
    setValue(id.toString());
    onChange(id);
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
