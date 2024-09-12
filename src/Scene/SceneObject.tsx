import React from 'react';
import styles from './Scene.module.scss';
import type { SceneObjectInterface } from "./Types/Types";

type PropsType = {
  object: SceneObjectInterface,
  onClick?: (object: SceneObjectInterface) => void,
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
