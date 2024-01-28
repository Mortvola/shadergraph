import React from 'react';
import Http from './Http/src';
import UploadFileButton from './UploadFileButton';
import SidebarList from './SidebarList';
import { useStores } from './State/store';
import { TextureRecord } from './State/types';
import TextureListEntry from './TextureListEntry';
import { observer } from 'mobx-react-lite';

const TextureList: React.FC = observer(() => {
  const store = useStores();
  const [textures, setTextures] = React.useState<TextureRecord[]>([])

  const queryList = async () => {
    const response = await Http.get<TextureRecord[]>('/textures-list');

    if (response.ok) {
      const list = await response.body()

      setTextures(list);
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
      setTextures((prev) => {
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

  const handleSelect = (id: number) => {
    const selection = textures.find((t) => t.id === id)

    if (selection) {
      store.selectTexture(selection);
    }
  }

  const renderAddButton = () => (
    <UploadFileButton onFileSelection={handleFileSelection} label="Add" />
  )

  return (
    <SidebarList title="Textures" addButton={renderAddButton()}>
      {
        textures.map((t) => (
          <TextureListEntry
            key={t.id}
            texture={t}
            onDelete={handleDelete}
            onSelect={handleSelect}
            selected={store.selectionType === 'Texture' && t.id === store.selectedTexture?.id}
          />
        ))
      }              
    </SidebarList>
  )
})

export default TextureList;
