import React from 'react';
import styles from './Scene.module.scss';
import type { SceneNodeInterface } from "./Types/Types";

type PropsType = {
  object: SceneNodeInterface,
  onClick?: (object: SceneNodeInterface) => void,
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
