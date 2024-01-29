import React from 'react';
import Http from '../Http/src';
import UploadFileButton from '../UploadFileButton';
import SidebarList from './SidebarList';
import { ModelRecord } from '../State/types';
import { observer } from 'mobx-react-lite';
import { useStores } from '../State/store';
import { runInAction } from 'mobx';
import Model from '../State/Model';
import ModelListEntry from './ModelListEntry';

const ModelList: React.FC = observer(() => {
  const store = useStores();
  const { models } = store;

  const queryList = React.useCallback(async () => {
    const response = await Http.get<ModelRecord[]>('/models-list');

    if (response.ok) {
      const list = await response.body()

      runInAction(() => {
        store.models = list.map((m) => new Model(m.id, m.name));
      })
    }
  }, [store])

  React.useEffect(() => {
    queryList()
  }, [queryList])

  const handleFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append('file', event.target.files[0])

      const response = await fetch('/models', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const model = await response.json() as { id: number, name: string };

        runInAction(() => {
          store.models = store.models.concat(new Model(model.id, model.name))
        })
      }
    }
  }

  const handleDelete = async (id: number) => {
    const response = await Http.delete(`/models/${id}`)

    if (response.ok) {
      runInAction(() => {
        const index = models.findIndex((m) => m.id === id)

        if (index !== -1) {
          store.models = [
            ...models.slice(0, index),
            ...models.slice(index + 1),
          ]
        }
      });
    }
  }

  const handleSelect = (id: number) => {
    const selection = models.find((m) => m.id === id)

    if (selection) {
      store.selectModel(selection)
    }
  }

  const renderAddButton = () => (
    <UploadFileButton onFileSelection={handleFileSelection} label="Add" />
  )

  return (
    <SidebarList title="Models" addButton={renderAddButton()}>
      {
        models.map((m) => (
          <ModelListEntry
            key={m.id}
            model={m}
            onDelete={handleDelete}
            onSelect={handleSelect}
            selected={store.selectionType === 'Model' && m.id === store.selectedModel?.id}
          />
        ))
      }              
    </SidebarList>
  )
})

export default ModelList;
