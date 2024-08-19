import React from 'react';
import GradientEditorPopup from './GradientEditorPopup';
import styles from './ColorPicker.module.scss'
import { getGradientCss } from './Color';
import { observer } from 'mobx-react-lite';
import Gradient from '../Inspector/Gradient';

type PropsType = {
  value: Gradient,
}

const GradientEditor: React.FC<PropsType> = observer(({
  value,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>();
  const ref = React.useRef<HTMLDivElement>(null);
  const [colorGradient, setColorGradient] = React.useState<string>('')

  React.useEffect(() => {
    const gradients = getGradientCss(value.colorKeys, value.alphaKeys)
    setColorGradient(gradients)
  }, [value.alphaKeys, value.colorKeys])

  const handleOpenClick: React.MouseEventHandler = (event) => {
    event.stopPropagation();
    
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
        className={`${styles.gradientSample} ${styles.checkerboard}`}
        onClick={handleOpenClick}
      >
        <div style={{ background: `linear-gradient(90deg, ${colorGradient})`}} />
      </div>
      {
        open
          ? (
            <GradientEditorPopup
              value={value}
              onClose={handleClose} rect={open}
            />
          )
          : null
      }
    </>
  )
})

export default GradientEditor;
