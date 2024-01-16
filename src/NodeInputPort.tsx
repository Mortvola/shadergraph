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
  const { dragMap, graph, modeler } = useStores();
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

    const outputPort = dragMap.get(data) as OutputPortInterface;

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

  return (
    <div ref={portRef} className={styles.inputport} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div>{ port.name }</div>
      <div>{ port.type }</div>
    </div>
  )
}

export default NodeInputPort;
