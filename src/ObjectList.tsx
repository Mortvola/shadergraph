import React from 'react';
import Http from './Http/src';
import SidebarList from './SidebarList';
import SelectModel from './SelectModel';
import ObjectListEntry from './ObjectListEntry';
import { useStores } from './State/store';

const ObjectList: React.FC = () => {
  const store = useStores();

  const [objects, setObjects] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/game-objects-list');

    if (response.ok) {
      const list = await response.body()

      setObjects(list);
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const handleAdd = async (entry: { id: number, name: string }) => {
    await Http.post('/game-objects', {
      name: entry.name.replace(/\.[^/.]+$/, ''),
      object: { 
        modelId: entry.id,
      }
    })
  }

  const [selection, setSelection] = React.useState<{ id: Number, name: string } | null>(null);

  const handleSelect = (selection: { id: number, name: string }) => {
    setSelection(selection);

    store.selectObject(selection.id);
  }

  const renderAddButton = () => (
    <SelectModel onSelection={handleAdd} />
  )

  return (
    <SidebarList title="Game Objects" addButton={renderAddButton()}>
      {
        objects.map((o) => (
          <ObjectListEntry key={o.id} object={o} onSelect={handleSelect} selected={o.id === selection?.id } />
        ))
      }              
    </SidebarList>
  )
}

export default ObjectList;
