import React from 'react';
import styles from './Node.module.scss';
import { InputPortInterface, OutputPortInterface, convertType, getLength } from '../Renderer/ShaderBuilder/Types';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import { createPortal } from 'react-dom';
import SimpleVector from './SimpleValues/SimpleVector';
import SimpleUV from './SimpleValues/SimpleUV';
import SimpleFloat from './SimpleValues/SimpleFloat';
import { GraphInterface } from '../State/GraphInterface';

type PropsType = {
  graph: GraphInterface,
  port: InputPortInterface,
  parentRef: React.RefObject<HTMLElement>
  translate?: { x: number, y: number },
  scale?: number,
  origin?: { x: number, y: number },
}

const NodeInputPort: React.FC<PropsType> = observer(({
  graph,
  port,
  parentRef,
  translate = { x: 0, y: 0},
  scale = 1,
  origin = { x: 0, y: 0},
}) => {
  const store = useStores();
  const portRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const element = portRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      port.offsetX = rect.left - ((port.node.position!.x + translate.x) * scale + (origin.x - origin.x * scale))
      port.offsetY = rect.top + (rect.height / 2) - ((port.node.position!.y + translate.y) * scale + (origin.y - origin.y * scale))
    }
  }, [origin.x, origin.y, port, scale, translate.x, translate.y]);

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
    else {
      event.dataTransfer.dropEffect = 'none';
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

  const handleValueChange = () => {
    if (store.graph && store.previewModeler.model) {
      const drawable = store.previewModeler.getDrawableNode(store.previewModeler.model);
      drawable?.material.setPropertyValues(GPUShaderStage.FRAGMENT, [{ name: port.constantName, value: port.value!, builtin: false }])
    }
  }

  const simpleValue = () => {
    if (port.value !== null && port.value !== undefined) {
      switch (port.value.dataType) {
        case 'float':
          return <SimpleFloat graph={graph} value={port.value} onChange={handleValueChange} />

        case 'vec2f':
        case 'vec3f':
        case 'vec4f':
          return Array.isArray(port.value.value)
          ? <SimpleVector value={port.value.value as number[]} length={getLength(port.value.dataType)} onChange={handleValueChange} />
          : null
        case 'uv':
          return <SimpleUV />
      }      
    }

    return null;
  }
  
  const renderSimpleValues = () => {
    const parent = parentRef.current;

    if (!port.edge && parent) {
      return (
        <>
          {
            createPortal(
              <div
                className={styles.defaults}
                style={{
                  left: origin.x - origin.x * scale + (port.node.position!.x + translate.x) * scale + port.offsetX,
                  top: origin.y - origin.y * scale + (port.node.position!.y + translate.y) * scale + port.offsetY,
                  transform: `translate(calc(-${100 * scale}% - ${15 * scale}px), -${50 * scale}%)  scale(${scale})`
                }}
              >
                {
                  simpleValue()
                }
              </div>,
              parent,
            )
          }
          { /* Draw the line to the value element */
            createPortal(
              <div
                className={styles.defaultLine}
                style={{
                  left: ((port.node.position!.x + translate.x) * scale + (origin.x - origin.x * scale)) + port.offsetX,
                  top: ((port.node.position!.y + translate.y) * scale + (origin.y - origin.y * scale)) + port.offsetY,
                  transform: `translate(-${15 * scale}px, 0) scale(${scale})`
                }}
              />,
              parent,
            )
          }
        </>
      )
    }

    return null;
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
      <div>{ `${port.name} (${convertType(port.getDataType())})` }</div>
      {
        renderSimpleValues()
      }
    </div>
  )
})

export default NodeInputPort;
