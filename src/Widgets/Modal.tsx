import React from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';

type PropsType = {
  show: boolean,
  onHide: () => void,
  children: React.ReactNode,
}

const Modal: React.FC<PropsType> = ({
  show,
  onHide,
  children
}) => {
  const handleWrapperClick = () => {
    onHide()
  }

  const handlePointerDown: React.PointerEventHandler = (event) => {
    event.stopPropagation();
  }

  if (!show) {
    return null;
  }
  
  return (
    createPortal(
      <div className={styles.wrapper} onClick={handleWrapperClick} onPointerDown={handlePointerDown}>
        { children }
      </div>,
      document.body,
    )
  )
}

export default Modal;
