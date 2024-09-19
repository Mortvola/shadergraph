import React from 'react';
import styles from './Overrides.module.scss';
import type { SceneObjectInterface } from '../Scene/Types/Types';

type PropsType = {
  connectedObject: SceneObjectInterface,
}

const OverrideConnection: React.FC<PropsType> = ({
  connectedObject
}) => {
  const handleRevertClick = () => {
  }

  const handleApplyClick = () => {
    // if (isPrefabInstanceObject(connectedObject.parent)) {
    //   connectedObject.parent.prefabInstance.attachSceneNode(connectedObject);
    // }
  }

  return (
    <div className={styles.comparison}>
      <div className={styles.buttons}>
        <button onClick={handleRevertClick}>Revert</button>
        <button onClick={handleApplyClick}>Apply</button>
      </div>
    </div>
  )
}

export default OverrideConnection;
