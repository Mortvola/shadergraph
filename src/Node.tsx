import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Node.module.scss';
import NodeInputPort from './NodeInputPort';
import NodeOutputPort from './NodeOutputPort';
import { GraphNodeInterface, isOperationNode, isPropertyNode } from './shaders/ShaderBuilder/Types';
import { useStores } from './State/store';
import PropertyFields from './PropertyFields';
import Draggable from './Draggable';

type PropsType = {
  node: GraphNodeInterface,
}

const Node: React.FC<PropsType> = observer(({
  node,
}) => {
  const { graph } = useStores();

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    graph.selectNode(node)
  }

  const handleMove = (x: number, y: number) => {
    graph.setNodePosition(node, x, y);
  }

  const renderNode = () => {
    if (isOperationNode(node)) {
      return (
        <>
          <div className={styles.title}>{node.name}</div>
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
        </>      
      )
    }

    if (isPropertyNode(node)) {
      return (
        <>
          <div className={styles.property}>
            <div className={styles.title}>{node.name}</div>
              {
                node.outputPort
                  ? <NodeOutputPort port={node.outputPort} hideName />
                  : null
              }
          </div>
          <div className={styles.propertybody}>
            {
              !node.readonly
                ? <PropertyFields node={node} />
                : null
            }
          </div>
        </>
      )
    }

    return null;
  }

  return (
    <Draggable position={node} onMove={handleMove}>
      <div
        className={`${styles.node} ${node === graph.selectedNode ? styles.selected : ''}`}
        onPointerDown={handlePointerDown}
      >
        {
          renderNode()
        }
      </div>
    </Draggable>
  );
})

export default Node;
