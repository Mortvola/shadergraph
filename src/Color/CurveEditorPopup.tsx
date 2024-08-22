import React from 'react';
import { createPortal } from 'react-dom';
import styles from './CurveEditor.module.scss';
import { observer } from 'mobx-react-lite';
import CurveGraph from './CurveGraph';
import PSCurve from '../Renderer/ParticleSystem/PSCurve';

type PropsType = {
  value: PSCurve,
  onClose: () => void,
  rect: DOMRect,
}

const CurveEditorPopup: React.FC<PropsType> = observer(({
  value,
  onClose,
  rect,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [wrapperBounds, setWrapperBounds] = React.useState<DOMRect>();

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setWrapperBounds(rect);
    }
  }, [])

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    console.log(event.code)
    event.stopPropagation();
    // if (event.code === 'Backspace' || event.code === 'Delete') {
    //   if (selectedAlphaId !== undefined) {
    //     deleteAlphaKey(selectedAlphaId)
    //   }
    //   else if (selectedColorId !== undefined) {
    //     deleteColorKey(selectedColorId)
    //   }
    // }
  }

  // const handlePositionChange = (value: number) => {
  //   if (selectedAlphaId !== undefined) {
  //     handleMoveAlphaKey(selectedAlphaId, value)
  //   }
  //   else if (selectedColorId !== undefined) {
  //     handleMoveColorKey(selectedColorId, value)
  //   }
  // }

  return (
    createPortal(
      <div
        ref={ref}
        className={styles.wrapper}
        onClick={onClose}
      >
        {
          wrapperBounds
            ? (
              <div
                className={styles.popup}
                style={{ left: rect.left, bottom: wrapperBounds!.bottom - rect.top }}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
              >
                <div className={`${styles.graph}  ${styles.checkerboard}`}>
                  <CurveGraph value={value} />
                </div>
              </div>
            )
            : null
        }
      </div>,
      document.body,
    )
  )
})

export default CurveEditorPopup;
