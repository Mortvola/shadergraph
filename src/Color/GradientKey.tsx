import React from 'react';
import styles from './ColorPicker.module.scss';
import { AlphaGradientKey } from '../Renderer/types';

type PropsType = {
  alphaKey: AlphaGradientKey,
  position: number,
  selected?: boolean,
  onClick?: (index: number) => void,
}

const GradientKey: React.FC<PropsType> = ({
  alphaKey,
  position,
  selected = false,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(alphaKey.id)
    }
  }

  return (
    <div
      className={`${styles.key} ${selected ? styles.selected : ''}`}
      style={{ left: `${position}px` }}
      onClick={handleClick}
    />
  )
}

export default GradientKey;
