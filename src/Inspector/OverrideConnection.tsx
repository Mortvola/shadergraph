import React from 'react';
import styles from './Overrides.module.scss';
import type SceneNode from '../Scene/Types/SceneNode';
import { PopupContext } from './PopupContext';

type PropsType = {
  connection: SceneNode,
}

const OverrideConnection: React.FC<PropsType> = ({
  connection,
}) => {
  const popupContext = React.useContext(PopupContext)

  const handleRevertClick = () => {
  }

  const handleApplyClick = () => {
    connection.applyConnectionOverride()
    popupContext.hidePopup()
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
