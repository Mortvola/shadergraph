import React from 'react';
import ShaderList from './Project/ShaderList';
import ModelList from './Project/ModelList';
import MaterialList from './Project/MaterialList';
import styles from './MainView.module.scss';
import Toolbar from './ShaderEditor/Toolbar';
import UploadFileButton from './UploadFileButton';
import TextureList from './Project/TextureList';
import Canvas3d from './Canvas3d';
import { useStores } from './State/store';
import ObjectList from './Project/ObjectList';
import Inspector from './Inspector';

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

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey) {
      mainView?.camera.changeOffset(event.deltaY * 0.01);
    }
    else {
      mainView?.camera.changeRotation(event.deltaX * 0.2)
    }

    event.stopPropagation();
  }

  return (
    <div className={styles.main}>
      <div>
        <Canvas3d renderer={mainView} onWheel={handleWheel} />
        <Inspector />
      </div>
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
