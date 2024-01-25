import React from 'react';
import Http from './Http/src';
import UploadFileButton from './UploadFileButton';
import SidebarList from './SidebarList';
import { ModelRecord } from './State/types';
import ModelListEntry from './ModelListEntry';

const ModelList: React.FC = () => {
  const [models, setModels] = React.useState<ModelRecord[]>([])

  const queryList = async () => {
    const response = await Http.get<ModelRecord[]>('/models-list');

    if (response.ok) {
      const list = await response.body()

      setModels(list);
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const handleFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append('file', event.target.files[0])

      await fetch('/models', {
        method: 'POST',
        body: formData
      })
    }
  }

  const handleDelete = async (id: number) => {
    const response = await Http.delete(`/models/${id}`)

    if (response.ok) {
      setModels((prev) => {
        const index = models.findIndex((m) => m.id === id)

        if (index !== -1) {
          return [
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ]
        }

        return prev;
      })
    }
  }

  const renderAddButton = () => (
    <UploadFileButton onFileSelection={handleFileSelection} label="Add" />
  )

  return (
    <SidebarList title="Models" addButton={renderAddButton()}>
      {
        models.map((m) => (
          <ModelListEntry key={m.id} model={m} onDelete={handleDelete} />
        ))
      }              
    </SidebarList>
  )
}

export default ModelList;
