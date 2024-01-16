import React from 'react';
import styles from './Node.module.scss';
import { useStores } from './State/store';
import { OutputPortInterface } from './shaders/ShaderBuilder/Types';

type PropsType = {
  port: OutputPortInterface,
}

const NodeOutputPort: React.FC<PropsType> = ({
  port,
}) => {
  const { graph, dragMap } = useStores();
  const [startPoint, setStartPoint] = React.useState<[number, number] | null>(null);
  const [dragKey, setDragKey] = React.useState<string | null>(null);
  const portRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const element = portRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      port.offsetX = rect.right - port.node.x;
      port.offsetY = rect.top + rect.height / 2 - port.node.y;
    }
  }, [port]);

  const handleDragStart: React.DragEventHandler = (event) => {
    event.dataTransfer.dropEffect = 'link';
    
    const key = `${port.node.id}:${port.name}`;
    dragMap.set(key, port);
    setDragKey (key);

    event.dataTransfer.setData("application/output-port", key);

    const element = portRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();
      setStartPoint([rect.right, rect.top + rect.height / 2]);
    }
  }

  const handleDrag: React.DragEventHandler = (event) => {
    if (startPoint && event.clientX !== 0 && event.clientY !== 0) {
      graph.setDragConnector([startPoint, [event.clientX, event.clientY]])
    }
    else {
      graph.setDragConnector(null)

      if (dragKey) {
        dragMap.delete(dragKey);
        setStartPoint(null);  
      }
    }
  }

  const handleDragEnd: React.DragEventHandler = (event) => {
    graph.setDragConnector(null)
    setStartPoint(null);
    setDragKey(null);
  }

  const handleMouseDown: React.MouseEventHandler = (event) => {
    event.stopPropagation();
  }

  const handlePointerDown: React.PointerEventHandler = (event) => {
    event.stopPropagation();
  }

  return (
    <div
      ref={portRef}
      className={styles.outputport}
      draggable onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerDown}
    >
      <div>{ port.name }</div>
      <div>{ port.type }</div>
    </div>
  )
}

export default NodeOutputPort;
