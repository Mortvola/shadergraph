import React from 'react';
import ShaderList from './ShaderList';
import ModelList from './ModelList';
import MaterialList from './MaterialList';
import styles from './MainView.module.scss';
import Toolbar from './ShaderEditor/Toolbar';
import UploadFileButton from './UploadFileButton';
import TextureList from './TextureList';

type PropsType = {
  onEditShader: (id: number) => void,
}

const MainView: React.FC<PropsType> = ({
  onEditShader,
}) => {
  const handleEditShader = (id: number) => {
    onEditShader(id);
  }

  // const handleFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
  //   if (event.target.files && event.target.files[0]) {
  //     const formData = new FormData();
  //     formData.append('file', event.target.files[0])

  //     await fetch('/models', {
  //       method: 'POST',
  //       body: formData
  //     })
  //   }
  // }

  return (
    <div className={styles.main}>
      <div>
        {/* <Toolbar >
          <UploadFileButton onFileSelection={handleFileSelection} label="Upload Model" />
        </Toolbar> */}
      </div>
      <div className={styles.sidebar}>
        <ShaderList onEdit={handleEditShader} />
        <MaterialList />
        <TextureList />
        <ModelList />
      </div>
    </div>
  )
}

export default MainView;
