import React from 'react';
import styles from './ColorPicker.module.scss';

type PropsType = {
  id: number,
  position: number,
  selected?: boolean,
  onClick?: (index: number) => void,
}

const GradientKey: React.FC<PropsType> = ({
  id,
  position,
  selected = false,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id)
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
