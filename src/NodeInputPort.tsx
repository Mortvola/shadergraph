import React from 'react';
import styles from './Node.module.scss';
import { InputPortInterface, OutputPortInterface } from './shaders/ShaderBuilder/Types';
import { useStores } from './State/store';

type PropsType = {
  port: InputPortInterface,
}

const NodeInputPort: React.FC<PropsType> = ({
  port,
}) => {
  const store = useStores();
  const { graph, modeler } = store;
  const portRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const element = portRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      port.offsetX = rect.left - port.node.x;
      port.offsetY = rect.top + (rect.height / 2) - port.node.y;
    }
  }, [port]);

  const handleDragOver: React.DragEventHandler = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'link';
  }

  const handleDrop: React.DragEventHandler = (event) => {
    event.preventDefault();

    const data = event.dataTransfer.getData("application/output-port");

    if (data) {
      const outputPort = store.getDragObject() as OutputPortInterface;

      if (outputPort) {
        graph.link(outputPort, port);

        (async () => {
          const material = await graph.generateMaterial();

          if (material) {
            modeler.applyMaterial(material);
          }
        })()
      }
    }

    graph.setDragConnector(null)
  }

  const [startPoint, setStartPoint] = React.useState<[number, number] | null>(null);
  const [dragKey, setDragKey] = React.useState<string | null>(null);

  const handleDragStart: React.DragEventHandler = (event) => {
    if (port.edge) {
      event.dataTransfer.dropEffect = 'link';

      const outputPort = port.edge.output;

      store.setDragObject(outputPort);
      event.dataTransfer.setData("application/output-port", port.name);

      const outputNode = outputPort.node;
      
      const startX = outputNode.x + outputPort.offsetX;
      const startY = outputNode.y + outputPort.offsetY;

      setStartPoint([startX, startY]);

      graph.deleteEdge(port.edge);
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
      className={styles.inputport}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={port.edge !== null}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <div>{ port.name }</div>
      <div>{ port.type }</div>
    </div>
  )
}

export default NodeInputPort;
