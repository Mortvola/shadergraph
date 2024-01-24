import React from 'react';
import Http from './Http/src';
import styles from './ModelList.module.scss';
import UploadFileButton from './UploadFileButton';

const ModelList: React.FC = () => {
  const [models, setModels] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/models-list');

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

  return (
    <div className={styles.list}>
      Models
      <UploadFileButton onFileSelection={handleFileSelection} label="Add" />
      {
        models.map((m) => (
          <div key={m.id}>{m.name}</div>
        ))
      }              
    </div>
  )
}

export default ModelList;
