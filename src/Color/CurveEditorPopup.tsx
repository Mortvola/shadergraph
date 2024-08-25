import React from 'react';
import { createPortal } from 'react-dom';
import styles from './CurveEditor.module.scss';
import { observer } from 'mobx-react-lite';
import CurveGraph from './CurveGraph';
import PSCurve from '../Renderer/ParticleSystem/PSCurve';
import NumberInput from '../Inspector/NumberInput';

type PropsType = {
  value: PSCurve,
  range?: [number, number],
  onRangeChange?: (range: [number, number]) => void,
  onClose: () => void,
  rect: DOMRect,
}

const CurveEditorPopup: React.FC<PropsType> = observer(({
  value,
  range = [0, 1],
  onRangeChange,
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

  const handleMinRangeChange = (min: number) => {
    if (onRangeChange) {
      onRangeChange([min, range[1]])
    }
  }

  const handleMaxRangeChange = (max: number) => {
    if (onRangeChange) {
      onRangeChange([range[0], max])
    }
  }

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
                <div className={styles.range}>
                <NumberInput value={range[1]} onChange={handleMaxRangeChange} />
                <NumberInput value={range[0]} onChange={handleMinRangeChange} />
                </div>
                <div className={styles.graph}>
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
