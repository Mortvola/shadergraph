import React, { type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import styles from './PopupWrapper.module.scss';

export enum Position {
  top,
  left,
  bottom,
  right,
}

type PropsType = {
  onClose: () => void,
  rect: DOMRect,
  position?: Position,
  children?: React.ReactNode,
}

const PopupWrapper: React.FC<PropsType> = observer(({
  onClose,
  rect,
  position = Position.top,
  children,
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [popupSize, setPopupSize] = React.useState<{ width: number, height: number }>()
  // const [wrapperBounds, setWrapperBounds] = React.useState<DOMRect>();

  const [offset, setOffset] = React.useState<CSSProperties>(
    { left: 0, top: 0, visibility: 'hidden' },
  );

  // React.useEffect(() => {
  //   const element = wrapperRef.current;

  //   if (element) {
  //     const rect = element.getBoundingClientRect();

  //     setWrapperBounds(rect);
  //   }
  // }, [])

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  React.useEffect(() => {
    const element = popupRef.current;

    if (element) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.borderBoxSize?.[0].inlineSize;
          const height = entry.borderBoxSize?.[0].blockSize;
          console.log(`width: ${width}, height: ${height}`)

          setPopupSize({ width, height })
        }
      })

      resizeObserver.observe(element, { box: 'content-box' });

      return () => resizeObserver.disconnect();
    }
  }, []);

  React.useEffect(() => {
    const wrapperElement = wrapperRef.current;
    // const element = popupRef.current;

    if (wrapperElement && popupSize) {
      const wrapperRect = wrapperElement.getBoundingClientRect();
      // const elementRect = element.getBoundingClientRect();

      const height = popupSize.height
      const width = popupSize.width

      const newOffset: CSSProperties = {}

      if (position === Position.top) {
        // If the menu will be outside the bottom of the wrapper then make adjustments.
        if (rect.top - height >= wrapperRect.top) {
          newOffset.bottom = wrapperRect.bottom - rect.top
        }
        else if (rect.bottom + height <= wrapperRect.bottom) {
          newOffset.top = rect.bottom - wrapperRect.top
        }
        else {
          const adjustment = (rect.top - height);
          newOffset.bottom = wrapperRect.bottom - rect.top + adjustment
        }

        // If the menu will be outside the bottom of the wrapper then make adjustments.
        if (rect.left + width <= wrapperRect.right) {
          newOffset.left = rect.left;
        }
        else {
          const adjustment = rect.left + width - wrapperRect.right;
          newOffset.left = rect.left - adjustment;
        }
      }
      else if (position === Position.left) {
        if (rect.right + width <= wrapperRect.right) {
          newOffset.left = rect.right;
        }
        else if (rect.left - width >= wrapperRect.left) {
          newOffset.right = wrapperRect.right - rect.left;
        }
        else {
          const adjustment = rect.right + width - wrapperRect.right;
          newOffset.left = rect.right - adjustment;
        }

        newOffset.top = rect.top + (rect.bottom - rect.top) / 2 - height / 2;
      }


      setOffset({ ...newOffset, visibility: 'visible' });
    }
  }, [wrapperRef.current, popupSize, rect.left, rect.top])
  
  return (
    createPortal(
      <div
        ref={wrapperRef}
        className={styles.wrapper}
        onClick={onClose}
      >
        <div
          ref={popupRef}
          className={styles.popup}
          style={offset}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          { children }
        </div>
      </div>,
      document.body,
    )
  )
})

export default PopupWrapper;
