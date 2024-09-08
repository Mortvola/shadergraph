import React from 'react';
import styles from './Overrides.module.scss';
import type { SceneObjectBaseInterface } from '../Scene/Types/Types';
import { isPrefabInstanceObject } from '../Scene/Types/PrefabInstanceObject';

type PropsType = {
  connectedObject: SceneObjectBaseInterface,
}

const OverrideConnection: React.FC<PropsType> = ({
  connectedObject
}) => {
  const handleRevertClick = () => {
  }

  const handleApplyClick = () => {
    if (isPrefabInstanceObject(connectedObject.parent)) {
      connectedObject.parent.prefabInstance.attachSceneObject(connectedObject);
    }
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
