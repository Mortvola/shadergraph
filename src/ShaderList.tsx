import React from 'react';
import Http from './Http/src';
import ShaderListEntry from './ShaderListEntry';
import { useStores } from './State/store';
import Graph from './State/Graph';
import SidebarList from './SidebarList';

type PropsType = {
  onEdit: (id: number) => void,
}

const ShaderList: React.FC<PropsType> = ({
  onEdit,
}) => {
  const store = useStores();
  const [shaders, setShaders] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/shader-list');

    if (response.ok) {
      const list = await response.body()

      setShaders(list);
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const handleAddClick = () => {
    store.graph = new Graph(store);
  }

  const renderButton = () => (
    <button type="button" onClick={handleAddClick}>Add</button>
  )

  return (
    <SidebarList title="Shaders" addButton={renderButton()}>
      {
        shaders.map((s) => (
          <ShaderListEntry key={s.id} item={s} onEdit={onEdit} />
        ))
      }
    </SidebarList>
  )
}

export default ShaderList;
