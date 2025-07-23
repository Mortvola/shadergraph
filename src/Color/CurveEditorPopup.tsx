import React from 'react';
import { createPortal } from 'react-dom';
import styles from './CurveEditor.module.scss';
import { observer } from 'mobx-react-lite';
import CurveGraph from './CurveGraph';
import type PSCurve from '../Renderer/Properties/PSCurve';
import NumberInput from '../Inspector/NumberInput';

type PropsType = {
  value: PSCurve,
  range?: [number, number],
  onRangeChange?: (range: [number, number]) => void,
  onClose: () => void,
  parentRect: DOMRect,
}

const CurveEditorPopup: React.FC<PropsType> = observer(({
  value,
  range = [0, 1],
  onRangeChange,
  onClose,
  parentRect,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<React.CSSProperties>();

  React.useLayoutEffect(() => {
    const wrapperElement = ref.current;
    const popupElement = popupRef.current;

    if (wrapperElement && popupElement) {
      const wrapperRect = wrapperElement.getBoundingClientRect();
      const popupRect = popupElement.getBoundingClientRect()

      if (parentRect.left + popupRect.width <= wrapperRect.right) {
        setPosition({ left: parentRect.left, bottom: wrapperRect.bottom - parentRect.top });
      } else {
        setPosition({ right: wrapperRect.right - parentRect.right, bottom: wrapperRect.bottom - parentRect.top });
      }
    }
  }, [])

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
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
        <div
          ref={popupRef}
          className={styles.popup}
          style={position}
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
      </div>,
      document.body,
    )
  )
})

export default CurveEditorPopup;
