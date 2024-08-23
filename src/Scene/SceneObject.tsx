import React from 'react';
import SceneObjectData from '../State/SceneObject';
import styles from './Scene.module.scss';

type PropsType = {
  object: SceneObjectData,
  onClick?: (object: SceneObjectData) => void,
  selected?: boolean,
}

const SceneObject: React.FC<PropsType> = ({
  object,
  onClick,
  selected = false,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(object)
    }
  }

  return (
    <div className={selected ? styles.selected : ''} onClick={handleClick}>{object.name}</div>
  )
}

export default SceneObject;
