import React from 'react';
import styles from './Node.module.scss';
import { useStores } from '../State/store';
import type { OutputPortInterface} from '../Renderer/ShaderBuilder/Types';
import { convertType } from '../Renderer/ShaderBuilder/Types';
import { observer } from 'mobx-react-lite';

type PropsType = {
  port: OutputPortInterface,
  hideName?: boolean,
  translate?: { x: number, y: number },
  scale?: number,
  origin?: { x: number, y: number },
}

const NodeOutputPort: React.FC<PropsType> = observer(({
  port,
  hideName = false,
  translate = { x: 0, y: 0},
  scale = 1,
  origin = { x: 0, y: 0},
}) => {
  const store = useStores();
  const { graph } = store;

  if (!graph) {
    return null;
  }
  
  const [startPoint, setStartPoint] = React.useState<[number, number] | null>(null);
  const [dragKey, setDragKey] = React.useState<string | null>(null);
  const portRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const element = portRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      port.offsetX = rect.right - ((port.node.position!.x + translate.x) * scale + (origin.x - origin.x * scale));
      port.offsetY = rect.top + rect.height / 2 - ((port.node.position!.y + translate.y) * scale + (origin.y - origin.y * scale));
    }
  }, [origin.x, origin.y, port, scale, translate.x, translate.y]);

  const handleDragStart: React.DragEventHandler = (event) => {
    event.dataTransfer.dropEffect = 'link';

    store.setDragObject(port);

    event.dataTransfer.setData("application/output-port", "output");

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
      className={`${styles.port} ${styles.output}`}
    >
      {
        !hideName
          ? <div>{ `${port.name} (${convertType(port.getDataType())})` }</div>
          : <div>{ convertType(port.getDataType()) }</div>
      }
      <div
        className={`${styles.connector} ${port.edges.length > 0 ? styles.connected : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
    </div>
  )
})

export default NodeOutputPort;
