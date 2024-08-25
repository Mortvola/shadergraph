import React from 'react';
import styles from './CurveEditor.module.scss'
import { observer } from 'mobx-react-lite';
import CurveEditorPopup from './CurveEditorPopup';
import PSCurve from '../Renderer/ParticleSystem/PSCurve';

type PropsType = {
  value: PSCurve,
  range?: [number, number],
  onRangeChange?: (range: [number, number]) => void,
}

const CurveEditor: React.FC<PropsType> = observer(({
  value,
  range,
  onRangeChange,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>();
  const ref = React.useRef<HTMLDivElement>(null);
  // const [colorGradient, setColorGradient] = React.useState<string>('')

  // React.useEffect(() => {
  //   const gradients = getGradientCss(value.colorKeys, value.alphaKeys)
  //   setColorGradient(gradients)
  // }, [value.alphaKeys, value.colorKeys])

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
        className={styles.sample}
        onClick={handleOpenClick}
      >
        <div />
      </div>
      {
        open
          ? (
            <CurveEditorPopup
              value={value}
              range={range}
              onRangeChange={onRangeChange}
              onClose={handleClose} rect={open}
            />
          )
          : null
      }
    </>
  )
})

export default CurveEditor;
