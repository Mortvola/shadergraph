import React from 'react';
import Http from './Http/src';
import SidebarList from './SidebarList';
import SelectModel from './SelectModel';
import ObjectListEntry from './ObjectListEntry';
import { useStores } from './State/store';
import { GameObjectRecord, ModelRecord } from './State/types';

const ObjectList: React.FC = () => {
  const store = useStores();

  const [objects, setObjects] = React.useState<GameObjectRecord[]>([])

  const queryList = async () => {
    const response = await Http.get<GameObjectRecord[]>('/game-objects-list');

    if (response.ok) {
      const list = await response.body()

      setObjects(list);
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const handleAdd = async (entry: ModelRecord) => {
    await Http.post('/game-objects', {
      name: entry.name.replace(/\.[^/.]+$/, ''),
      object: { 
        modelId: entry.id,
      }
    })
  }

  const [selection, setSelection] = React.useState<GameObjectRecord | null>(null);

  const handleSelect = (selection: GameObjectRecord) => {
    setSelection(selection);

    store.selectObject(selection);
  }

  const handleDelete = async (id: number) => {
    const response = await Http.delete(`/game-objects/${id}`)

    if (response.ok) {
      setObjects((prev) => {
        const index = objects.findIndex((o) => o.id === id)

        if (index !== -1) {
          return [
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ]
        }

        return prev;
      })

      if (selection?.id === id) {
        setSelection(null);
      }
    }
  }

  const renderAddButton = () => (
    <SelectModel onSelection={handleAdd} />
  )

  return (
    <SidebarList title="Game Objects" addButton={renderAddButton()}>
      {
        objects.map((o) => (
          <ObjectListEntry key={o.id} object={o} onSelect={handleSelect} onDelete={handleDelete} selected={o.id === selection?.id } />
        ))
      }              
    </SidebarList>
  )
}

export default ObjectList;
