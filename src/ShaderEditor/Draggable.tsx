import { observer } from 'mobx-react-lite';
import React from 'react';
import styles from './Draggable.module.scss';

type PropsType = {
  position: { x: number, y: number, width?: number, height?: number }
  children: React.ReactNode,
  onPositionChange?: (deltaX: number, deltaY: number) => void,
  onResize?: (x: number, y: number, width: number, height: number) => void,
  resizable?: boolean,
  style?: React.CSSProperties,
}

const Draggable: React.FC<PropsType> = observer(({
  position,
  children,
  onPositionChange,
  resizable = false,
  onResize,
  style,
}) => {
  type ResizeDirection = 'E' | 'W' | 'N' | 'S' | 'NW' | 'SW' | 'NE' | 'SE';

  type DragInfo = {
    x: number,
    y: number, 
    rect: { top: number, left: number, width: number, height: number },
    resize?: ResizeDirection,
  }

  const dragRef = React.useRef<HTMLDivElement | null>(null);
  const [dragInfo, setDragInfo] = React.useState<DragInfo | null>(null);
  const [resizeCursor, setResizeCursor] = React.useState<string>('');

  const getResizeDirection = (clientX: number, clientY: number, rect: DOMRect): ResizeDirection | undefined => {
    if (clientX >= rect.left && clientX < rect.left + 8) {
      if (clientY >= rect.top && clientY < rect.top + 8) {
        return 'NW'
      }

      if (clientY >= rect.bottom - 8 && clientY < rect.bottom) {
        return 'SW'
      }

      return 'W';
    }

    if (clientX >= rect.right - 8 && clientX < rect.right) {
      if (clientY >= rect.top && clientY < rect.top + 8) {
        return 'NE'
      }
      
      if (clientY >= rect.bottom - 8 && clientY < rect.bottom) {
        return 'SE'
      }

      return 'E'
    }

    if (clientY >= rect.top && clientY < rect.top + 8) {
      return 'N'
    }

    if (clientY >= rect.bottom - 8 && clientY < rect.bottom) {
      return 'S'
    }
  }

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

      setDragInfo({
        x: event.clientX,
        y: event.clientY,
        rect: { top: rect.top, left: rect.left, width: rect.right - rect.left, height: rect.bottom - rect.top },
        resize: getResizeDirection(event.clientX, event.clientY, rect),
      });
    }
  }

  const handleLostPointerCapture: React.PointerEventHandler = (event) => {
    setDragInfo(null);
  }

  const handlePointerMoveCapture: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (dragInfo) {
      const element = dragRef.current;

      if (element) {
        const delta = { x: event.clientX - dragInfo.x, y: event.clientY - dragInfo.y };

        if (onResize && dragInfo.resize) {
          switch (dragInfo.resize) {
            case 'NW':
              onResize(
                dragInfo.rect.left + delta.x,
                dragInfo.rect.top + delta.y,
                dragInfo.rect.width - delta.x,
                dragInfo.rect.height - delta.y,
              );
              break;

            case 'SW':
              onResize(
                dragInfo.rect.left + delta.x,
                dragInfo.rect.top,
                dragInfo.rect.width - delta.x,
                dragInfo.rect.height + delta.y,
              );
              break;

            case 'NE':
              onResize(
                dragInfo.rect.left,
                dragInfo.rect.top + delta.y,
                dragInfo.rect.width + delta.x,
                dragInfo.rect.height - delta.y,
              );
              break;

            case 'SE':
              onResize(
                dragInfo.rect.left,
                dragInfo.rect.top,
                dragInfo.rect.width + delta.x,
                dragInfo.rect.height + delta.y,
              );
              break;

            case 'E':
              onResize(
                dragInfo.rect.left,
                dragInfo.rect.top,
                dragInfo.rect.width + delta.x,
                dragInfo.rect.height,
              );
              break;

            case 'W':
              onResize(
                dragInfo.rect.left + delta.x,
                dragInfo.rect.top,
                dragInfo.rect.width - delta.x,
                dragInfo.rect.height,
              );
              break;

            case 'N':
              onResize(
                dragInfo.rect.left,
                dragInfo.rect.top + delta.y,
                dragInfo.rect.width,
                dragInfo.rect.width - delta.y,
              );
              break;

            case 'S':
              onResize(
                dragInfo.rect.left,
                dragInfo.rect.top,
                dragInfo.rect.width,
                dragInfo.rect.width + delta.y,
              );
              break;
          }
        }
        else {
          if (onPositionChange) {
            onPositionChange(event.movementX, event.movementY)
          }
        }
      }
    }
  }

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (resizable) {
      const element = dragRef.current;

      if (element) {
        const rect = element.getBoundingClientRect();
  
        const direction = getResizeDirection(event.clientX, event.clientY, rect);

        switch (direction) {
          case 'NW':
          case 'SE':
            setResizeCursor(styles.resizeNWSE)
            break;

          case 'NE':
          case 'SW':
            setResizeCursor(styles.resizeNESW)
            break;

          case 'E':
          case 'W':
            setResizeCursor(styles.resizeEW)
            break;

          case 'N':
          case 'S':
            setResizeCursor(styles.resizeNS)
            break;

          default:
            setResizeCursor('')
        }
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
      className={`${styles.draggable} ${resizable ? styles.resizable : ''} ${resizeCursor}`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerMoveCapture={handlePointerMoveCapture}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      { children }
    </div>
  )
})

export default Draggable;
