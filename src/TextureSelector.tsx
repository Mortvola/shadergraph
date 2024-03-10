import React from 'react';
import Http from './Http/src';

type PropsType = {
  id?: number,
  onChange: (id: number) => void,
}

const TextureSelector: React.FC<PropsType> = ({
  id,
  onChange,
}) => {
  const [value, setValue] = React.useState<number | undefined>(id);

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const id = parseInt(event.target.value, 10);
    setValue(id);
    onChange(id);
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
    <select value={value ?? -1} onChange={handleChange}>
      <option key="Not Set" value={-1}>Not Set</option>
      {
        list.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))
      }
    </select>
  )
}

export default TextureSelector;
