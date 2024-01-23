import React from 'react';
import styles from './Node.module.scss';
import { InputPortInterface, OutputPortInterface, getLength } from './Renderer/ShaderBuilder/Types';
import { convertType, useStores } from './State/store';
import { observer } from 'mobx-react-lite';
import { createPortal } from 'react-dom';
import SimpleVector from './SimpleValues/SimpleVector';
import Value from './Renderer/ShaderBuilder/Value';
import SimpleUV from './SimpleValues/SimpleUV';
import SimpleFloat from './SimpleValues/SimpleFloat';
import { GraphInterface } from './State/types';

type PropsType = {
  graph: GraphInterface,
  port: InputPortInterface,
  parentRef: React.RefObject<HTMLElement>
}

const NodeInputPort: React.FC<PropsType> = observer(({
  graph,
  port,
  parentRef,
}) => {
  const store = useStores();
  const portRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const element = portRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      port.offsetX = rect.left - port.node.position!.x;
      port.offsetY = rect.top + (rect.height / 2) - port.node.position!.y;
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
        if (port.edge) {
          // Disconnect any edge already connected.
          graph.deleteEdge(port.edge);
        }

        graph.link(outputPort, port);
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
      
      const startX = outputNode.position!.x + outputPort.offsetX;
      const startY = outputNode.position!.y + outputPort.offsetY;

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

  const simpleValue = (value: Value) => {
    switch (value.dataType) {
      case 'float':
        return <SimpleFloat graph={graph} value={value} />

      case 'vec2f':
      case 'vec3f':
      case 'vec4f':
        return Array.isArray(value.value)
        ? <SimpleVector value={value.value as number[]} length={getLength(value.dataType)} />
        : null
      case 'uv':
        return <SimpleUV />
    }

    return null;
  }
  
  const renderSimpleValues = () => {
    const parent = parentRef.current;

    if (parent) {
      return (
        <>
          {
            createPortal(
              <div
                className={styles.defaults}
                style={{
                  left: port.node.position!.x + port.offsetX,
                  top: port.node.position!.y + port.offsetY,
                }}
              >
                {
                  port.value
                  ? simpleValue(port.value)
                  : null
                }
              </div>,
              parent,
            )
          }
          {
            createPortal(
              <div
                className={styles.defaultLine}
                style={{
                  left: port.node.position!.x + port.offsetX,
                  top: port.node.position!.y + port.offsetY,
                }}
              />,
              parent,
            )
          }
        </>
      )
    }
  }

  return (
    <div
      ref={portRef}
      className={`${styles.port} ${styles.input}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className={`${styles.connector} ${port.edge ? styles.connected : ''}`}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        draggable={port.edge !== null}
      />
      <div>{ `${port.name} (${convertType(port.dataType)})` }</div>
      {
        !port.edge && parentRef.current
          ? renderSimpleValues()
          : null
      }
    </div>
  )
})

export default NodeInputPort;
