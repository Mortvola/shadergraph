import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Node.module.scss';
import NodeInputPort from './NodeInputPort';
import NodeOutputPort from './NodeOutputPort';
import { GraphNodeInterface, isPropertyNode, isValueNode } from './shaders/ShaderBuilder/Types';
import { useStores } from './State/store';
import PropertyVec2f from './PropertyVec2f';
import Draggable from './Draggable';
import PropertyString from './PropertyString';

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
    if (isPropertyNode(node)) {
      return (
        <>
          <div className={styles.property}>
            <div className={styles.title}>{node.getName()}</div>
            {
              node.outputPort.map((p) => (
                <NodeOutputPort key={p.name} port={p} hideName />
              ))
            }
          </div>
        </>
      )
    }
    
    if (isValueNode(node)) {
      const propertyField = () => {
        switch (node.value.dataType) {
          case 'vec2f':
            return <PropertyVec2f node={node.value} />;

          case 'string':
          case 'texture2D':
            return <PropertyString node={node.value} />
        }

        return null;
      }

      return (
        <>
          <div className={styles.property}>
            {
              node.outputPort.map((p) => (
                <NodeOutputPort key={p.name} port={p} hideName />
              ))
            }
          </div>
          <div className={styles.propertybody}>
            {
              propertyField()
            }
          </div>
        </>
      )
    }

    return (
      <>
        <div className={styles.title}>{node.getName()}</div>
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
              node.outputPort.map((p) => (
                <NodeOutputPort key={p.name} port={p} />
              ))
            }
          </div>
        </div>    
      </>      
    )
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
