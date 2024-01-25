import React from 'react';
import Http from './Http/src';
import UploadFileButton from './UploadFileButton';
import SidebarList from './SidebarList';
import SidebarListEntry from './SidebarListEntry';

const TextureList: React.FC = () => {
  const [textures, setTexturs] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/textures-list');

    if (response.ok) {
      const list = await response.body()

      setTexturs(list);
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const handleFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append('file', event.target.files[0])

      await fetch('/textures', {
        method: 'POST',
        body: formData
      })
    }
  }

  const handleDelete = async (id: number) => {
    const response = await Http.delete(`/textures/${id}`)

    if (response.ok) {
      setTexturs((prev) => {
        const index = textures.findIndex((m) => m.id === id)

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
    <SidebarList title="Textures" addButton={renderAddButton()}>
      {
        textures.map((m) => (
          <SidebarListEntry key={m.id} id={m.id} onDelete={handleDelete}>
            <div key={m.id}>{m.name}</div>
          </SidebarListEntry>
        ))
      }              
    </SidebarList>
  )
}

export default TextureList;
