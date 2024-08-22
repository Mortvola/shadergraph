import React from 'react';
import styles from './CurveEditor.module.scss';

type PropsType = {
  id: number,
  x: number,
  y: number,
  control?: boolean,
  onMove?: (id: number, x: number, y: number) => void,
}

const CurvePoint: React.FC<PropsType> = ({
  id,
  x,
  y,
  control = false,
  onMove,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 });

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setOffset({ x: rect.width / 2, y: rect.height / 2 })
    }
  }, [])

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element) {
      element.setPointerCapture(event.pointerId);

      const rect = element.getBoundingClientRect();

      setDragOffset({ x: event.clientX - rect.left - offset.x, y: event.clientY - rect.top - offset.y })
    }
  }

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element && element.hasPointerCapture(event.pointerId) && onMove) {
      onMove(id, event.clientX - dragOffset.x, event.clientY - dragOffset.y)
    }
  }

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element) {
      element.releasePointerCapture(event.pointerId);
    }
  }
  
  return (
    <div
      ref={ref}
      className={`${styles.point} ${control ? styles.control : ''}`}
      style={{ left: x - offset.x, top: y - offset.y }}
      onPointerDownCapture={handlePointerDown}
      onPointerMoveCapture={handlePointerMove}
      onPointerUpCapture={handlePointerUp}
    />
  )
}

export default CurvePoint;
