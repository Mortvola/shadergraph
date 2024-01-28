import React from 'react';
import Http from './Http/src';
import ShaderListEntry from './ShaderListEntry';
import { useStores } from './State/store';
import Graph from './State/Graph';
import SidebarList from './SidebarList';
import { ShaderRecord } from './State/types';
import { observer } from 'mobx-react-lite';

type PropsType = {
  onEdit: (id: number) => void,
}

const ShaderList: React.FC<PropsType> = observer(({
  onEdit,
}) => {
  const store = useStores();
  const [shaders, setShaders] = React.useState<ShaderRecord[]>([])

  const queryList = async () => {
    const response = await Http.get<ShaderRecord[]>('/shader-list');

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

  const handleDelete = async (id: number) => {
    const response = await Http.delete(`/shader-descriptors/${id}`)

    if (response.ok) {
      setShaders((prev) => {
        const index = shaders.findIndex((s) => s.id === id)

        if (index !== -1) {
          return [
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ]
        }

        return prev;
      })

      // if (selection?.id === id) {
      //   setSelection(null);
      // }
    }
  }

  const handleSelect = (id: number) => {
    const selection = shaders.find((s) => s.id === id)

    if (selection) {
      store.selectShader(selection)
    }
  }

  const renderButton = () => (
    <button type="button" onClick={handleAddClick}>Add</button>
  )

  return (
    <SidebarList title="Shaders" addButton={renderButton()}>
      {
        shaders.map((s) => (
          <ShaderListEntry
            key={s.id}
            item={s}
            onEdit={onEdit}
            onDelete={handleDelete}
            onSelect={handleSelect}
            selected={store.selectionType === 'Shader' && s.id === store.selectedShader?.id}
          />
        ))
      }
    </SidebarList>
  )
})

export default ShaderList;
