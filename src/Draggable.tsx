import { observer } from 'mobx-react-lite';
import React from 'react';

type PropsType = {
  position: { x: number, y: number }
  children: React.ReactNode,
  onMove: (x: number, y: number) => void,
}

const Draggable: React.FC<PropsType> = observer(({
  position,
  children,
  onMove,
}) => {
  const dragRef = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState<boolean>(false);
  const [start, setStart] = React.useState<{ x: number, y: number, top: number, left: number }>({ x: 0, y: 0, top: 0, left: 0});

  const getStyle = (l: number, t: number) => (
    { left: l, top: t }
  )

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();

    // graph.selectNode(node)
    const element = dragRef.current;

    if (element) {
      element.focus();
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
        // graph.setNodePosition(node, start.left + delta.x, start.top + delta.y);
        onMove(start.left + delta.x, start.top + delta.y)
      }
    }
  }

  const handleContextMenu: React.MouseEventHandler = (event) => {
    event.stopPropagation();

    if (!event.shiftKey) {
      event.preventDefault();
    }
  }

  return (
    <div
      ref={dragRef}
      className="draggable"
      style={getStyle(position.x, position.y)}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerMoveCapture={handlePointerMoveCapture}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      { children }
    </div>
  )
})

export default Draggable;
