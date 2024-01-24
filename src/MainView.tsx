import React from 'react';
import ShaderList from './ShaderList';
import ModelList from './ModelList';
import MaterialList from './MaterialList';
import styles from './MainView.module.scss';
import Toolbar from './ShaderEditor/Toolbar';
import UploadFileButton from './UploadFileButton';
import TextureList from './TextureList';
import Canvas3d from './Canvas3d';
import { useStores } from './State/store';
import ObjectList from './ObjectList';

type PropsType = {
  onEditShader: (id: number) => void,
}

const MainView: React.FC<PropsType> = ({
  onEditShader,
}) => {
  const { mainView } = useStores();
  
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
      <Canvas3d renderer={mainView} />
      <div className={styles.sidebar}>
        <TextureList />
        <ShaderList onEdit={handleEditShader} />
        <MaterialList />
        <ModelList />
        <ObjectList />
      </div>
    </div>
  )
}

export default MainView;
