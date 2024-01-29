import React from 'react';
import Http from '../Http/src';
import SidebarList from './SidebarList';
import SelectModel from './SelectModel';
import ObjectListEntry from './ObjectListEntry';
import { useStores } from '../State/store';
import { GameObjectRecord, ModelRecord } from '../State/types';
import { observer } from 'mobx-react-lite';
import GameObject from '../State/GameObject';

const ObjectList: React.FC = observer(() => {
  const store = useStores();

  const [objects, setObjects] = React.useState<GameObject[]>([])

  const queryList = async () => {
    const response = await Http.get<GameObjectRecord[]>('/game-objects-list');

    if (response.ok) {
      const list = await response.body()

      setObjects(list.map((o) => new GameObject(o.id, o.name, o.object.modelId, o.object.materials)));
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const handleAdd = async (entry: ModelRecord) => {
    const response = await Http.post<unknown, GameObjectRecord>('/game-objects', {
      name: entry.name.replace(/\.[^/.]+$/, ''),
      object: { 
        modelId: entry.id,
      }
    })

    if (response.ok) {
      const object = await response.body();

      setObjects((prev) => prev.concat(new GameObject(object.id, object.name, object.object.modelId, object.object.materials)))
    }
  }

  const handleSelect = (id: number) => {
    const selection = objects.find((o) => o.id === id)

    if (selection) {
      store.selectObject(selection);
    }
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

      if (store.selectedGameObject?.id === id) {
        store.selectObject(null);
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
          <ObjectListEntry
            key={o.id}
            object={o}
            onSelect={handleSelect}
            onDelete={handleDelete}
            selected={store.selectionType === 'Object' && o.id === store.selectedGameObject?.id }
          />
        ))
      }              
    </SidebarList>
  )
})

export default ObjectList;