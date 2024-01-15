import React from 'react';

const Node: React.FC = () => {
  const getStyle = (l: number, t: number) => (
    { left: l, top: t }
  )

  const dragRef = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState<boolean>(false);
  const [position, setPosition] = React.useState<{ left: number, top: number }>({ left: 100, top: 100 })
  const [start, setStart] = React.useState<{ x: number, y: number, top: number, left: number }>({ x: 0, y: 0, top: 0, left: 0});

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = dragRef.current;

    if (element) {
      element.setPointerCapture(event.pointerId);
      const rect = element.getBoundingClientRect();
      setStart({ x: event.clientX, y: event.clientY, top: rect.top, left: rect.left });
      setDragging(true);
    }
  }

  const handleLostPointerCapture: React.PointerEventHandler = (event) => {
    setDragging(false);
  }

  const handlePointerMoveCapture: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (dragging) {
      const element = dragRef.current;

      if (element) {
        const delta = { x: event.clientX - start.x, y: event.clientY - start.y };
        setPosition({ left: start.left + delta.x, top: start.top + delta.y })
      }
    }
  }

  return (
    <div
      ref={dragRef}
      className={`draggable`}
      style={getStyle(position.left, position.top)}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerMoveCapture={handlePointerMoveCapture}
    >
      Test
    </div>
  )
}

export default Node;
