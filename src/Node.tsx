import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Node.module.scss';
import NodeInputPort from './NodeInputPort';
import NodeOutputPort from './NodeOutputPort';
import { GraphNodeInterface, isOperationNode, isPropertyNode } from './shaders/ShaderBuilder/Types';
import { useStores } from './State/store';

type PropsType = {
  node: GraphNodeInterface,
}

const Node: React.FC<PropsType> = observer(({
  node,
}) => {
  const { graph } = useStores();
  const getStyle = (l: number, t: number) => (
    { left: l, top: t }
  )

  const dragRef = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState<boolean>(false);
  // const [position, setPosition] = React.useState<{ left: number, top: number }>({ left: 100, top: 100 })
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
        // setPosition({ left: start.left + delta.x, top: start.top + delta.y })
        graph.setNodePosition(node, start.left + delta.x, start.top + delta.y);
      }
    }
  }

  const renderNode = () => {
    if (isOperationNode(node)) {
      return (
        <div className={styles.body}>
          <div className={styles.inputports}>
            {
              node.inputPorts.map((p) => (
                <NodeInputPort key={p.name} port={p} />
              ))
            }
          </div>
          <div>
          </div>
          <div className={styles.outputports}>
            {
              node.outputPort
                ? <NodeOutputPort port={node.outputPort} />
                : null
            }
          </div>
        </div>          
      )
    }

    if (isPropertyNode(node)) {
      return (
        <div className={styles.body}>
          <div className={styles.inputports}>
          </div>
          <div>
          </div>
          <div className={styles.outputports}>
            {
              node.outputPort
                ? <NodeOutputPort port={node.outputPort} />
                : null
            }
          </div>
        </div>          
      )
    }

    return null;
  }

  return (
    <div
      ref={dragRef}
      className={`draggable`}
      style={getStyle(node.x, node.y)}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerMoveCapture={handlePointerMoveCapture}
    >
      <div className={styles.node}>
        <div className={styles.title}>{node.name}</div>
        {
          renderNode()
        }
      </div>
    </div>
  )
})

export default Node;
