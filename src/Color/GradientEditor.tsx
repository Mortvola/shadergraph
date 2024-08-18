import React from 'react';
import GradientEditorPopup from './GradientEditorPopup';
import styles from './ColorPicker.module.scss'
import { Gradient } from '../Renderer/types';

type PropsType = {
  value: Gradient,
  onChange: (gradient: Gradient) => void,
}

const GradientEditor: React.FC<PropsType> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>();
  const ref = React.useRef<HTMLDivElement>(null);

  const handleOpenClick = () => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setOpen(rect);
    }
  }

  const handleClose = () => {
    setOpen(null);
  }

  return (
    <>
      <div
        ref={ref}
        className={styles.sample}
        style={{ backgroundColor: `color(srgb-linear ${0} ${0} ${0})` }}
        onClick={handleOpenClick}
      />
      {
        open
          ? (
            <GradientEditorPopup
              value={value}
              onChange={onChange}
              onClose={handleClose} rect={open}
            />
          )
          : null
      }
    </>
  )
}

export default GradientEditor;
