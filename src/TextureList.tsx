import React from 'react';
import Http from './Http/src';
import styles from './TextureList.module.scss';
import UploadFileButton from './UploadFileButton';

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

  return (
    <div className={styles.list}>
      Textures
      <UploadFileButton onFileSelection={handleFileSelection} label="Add" />
      {
        textures.map((m) => (
          <div key={m.id}>{m.name}</div>
        ))
      }              
    </div>
  )
}

export default TextureList;
