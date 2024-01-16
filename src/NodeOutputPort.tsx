import React from 'react';
import styles from './Node.module.scss';
import { useStores } from './State/store';
import { OutputPortInterface } from './shaders/ShaderBuilder/Types';

type PropsType = {
  port: OutputPortInterface,
  hideName?: boolean,
}

const NodeOutputPort: React.FC<PropsType> = ({
  port,
  hideName = false,
}) => {
  const store = useStores();
  const { graph } = store;
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

    store.setDragObject(port);

    event.dataTransfer.setData("application/output-port", port.name);

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
        store.setDragObject(null);
        setStartPoint(null);  
      }
    }
  }

  const handleDragEnd: React.DragEventHandler = (event) => {
    graph.setDragConnector(null)
    setStartPoint(null);
    setDragKey(null);
  }

  return (
    <div
      ref={portRef}
      className={styles.outputport}
      draggable onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      {
        !hideName
          ? <div>{ port.name }</div>
          : null
      }
      <div>{ port.type }</div>
    </div>
  )
}

export default NodeOutputPort;
