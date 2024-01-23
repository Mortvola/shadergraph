import React from 'react';
import ShaderList from './ShaderList';
import ModelList from './ModelList';
import MaterialList from './MaterialList';
import styles from './MainView.module.scss';

type PropsType = {
  onEditShader: (id: number) => void,
}

const MainView: React.FC<PropsType> = ({
  onEditShader,
}) => {
  const handleEditShader = (id: number) => {
    onEditShader(id);
  }

  return (
    <div className={styles.main}>
      <div>
        Main
      </div>
      <div className={styles.sidebar}>
        <ShaderList onEdit={handleEditShader} />
        <MaterialList />
        <ModelList />
      </div>
    </div>
  )
}

export default MainView;
