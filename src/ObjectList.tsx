import React from 'react';
import Http from './Http/src';
import styles from './ObjectList.module.scss';
import UploadFileButton from './UploadFileButton';

const ObjectList: React.FC = () => {
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

  const handleFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append('file', event.target.files[0])

      await fetch('/game-objects', {
        method: 'POST',
        body: formData
      })
    }
  }

  return (
    <div className={styles.list}>
      Game Objects
      <UploadFileButton onFileSelection={handleFileSelection} label="Add" />
      {
        objects.map((o) => (
          <div key={o.id}>{o.name}</div>
        ))
      }              
    </div>
  )
}

export default ObjectList;
