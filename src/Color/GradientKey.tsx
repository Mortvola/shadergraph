import React from 'react';
import styles from './ColorPicker.module.scss';

type PropsType = {
  id: number,
  position: number,
  selected?: boolean,
  onClick?: (id: number) => void,
  onMove?: (id: number, clientX: number) => void,
}

const GradientKey: React.FC<PropsType> = ({
  id,
  position,
  selected = false,
  onClick,
  onMove,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = React.useState<number>(0);

  // Set the focus on the key if it is selected when it mounts.
  React.useEffect(() => {
    if (selected) {
      const element = ref.current;

      if (element) {
        element.focus();
      }
    }
  }, [selected])

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();

    if (onClick) {
      onClick(id)
    }
  }

  const handleFocus = () => {
    if (onClick) {
      onClick(id)
    }
  }

  // const handleMouseDown: React.MouseEventHandler = (event) => {
  //   event.stopPropagation()
  //   event.preventDefault()
  // }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element) {
      element.setPointerCapture(event.pointerId);

      const rect = element.getBoundingClientRect();

      setDragOffset(event.clientX - rect.left)
      // updatePoint(element, event);
    }
  }

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element && element.hasPointerCapture(event.pointerId) && onMove) {
      // The 8.5 is to account for the effects of the transform on the element for the key.
      // The element size is 12x12. Therefore,
      // a^2 + a^2 = c^2 (where is the distance from a corner to the center and c is the length of a side)
      // 2a^2 = 12 * 12
      // a^2 = 144 / 2
      // a = sqrt(72)
      // a = ~8.5
      onMove(id, event.clientX - dragOffset + 8.5)
    }
  }

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element) {
      element.releasePointerCapture(event.pointerId);

      // updatePoint(element, event);
    }
  }

  return (
    <div
      ref={ref}
      className={`${styles.key} ${selected ? styles.selected : ''}`}
      style={{ left: `${position}px` }}
      onClick={handleClick}
      // onMouseDown={handleMouseDown}
      tabIndex={0}
      onFocus={handleFocus}
      onPointerDownCapture={handlePointerDown}
      onPointerMoveCapture={handlePointerMove}
      onPointerUpCapture={handlePointerUp}
    />
  )
}

export default GradientKey;
