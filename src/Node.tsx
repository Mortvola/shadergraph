import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Node.module.scss';
import NodeInputPort from './NodeInputPort';
import NodeOutputPort from './NodeOutputPort';
import { GraphNodeInterface, isPropertyNode, isValueNode } from './shaders/ShaderBuilder/Types';
import { useStores } from './State/store';
import Vector from './Vector';
import Draggable from './Draggable';
import PropertyString from './PropertyString';
import exp from 'constants';

type PropsType = {
  node: GraphNodeInterface,
  parentRef: React.RefObject<HTMLElement>
}

const Node: React.FC<PropsType> = observer(({
  node,
  parentRef,
}) => {
  const { graph } = useStores();
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    graph.selectNode(node)
  }

  const handleMove = (x: number, y: number) => {
    graph.setNodePosition(node, x, y);
  }

  const handleExpansionClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    setExpanded((prev) => !prev);
    console.log(expanded);
    event.stopPropagation();
  }

  const handlePointerDown2: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const renderNode = () => {
    if (isPropertyNode(node)) {
      return (
        <>
          <div className={styles.property}>
            <div>{node.getName()}</div>
            {
              node.outputPort.map((p) => (
                <NodeOutputPort key={p.name} port={p} hideName />
              ))
            }
          </div>
        </>
      )
    }
    
    if (isValueNode(node) && !expanded) {
      const propertyField = () => {
        switch (node.value.dataType) {
          case 'vec2f':
          case 'vec3f':
          case 'vec4f':
            return <Vector node={node.value} />;

          case 'float':
            return <Vector node={node.value} />;

          case 'string':
          case 'texture2D':
            return <PropertyString node={node.value} />
        }

        return null;
      }

      return (
        <>
          <div className={styles.value}>
            {
              propertyField()
            }
            <div onClick={handleExpansionClick} onPointerDown={handlePointerDown2}>V</div>
            <NodeOutputPort key={node.outputPort[0].name} port={node.outputPort[0]} hideName />
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
                <NodeInputPort key={p.name} parentRef={parentRef} port={p} />
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
    <Draggable position={{ x: node.position!.x, y: node.position!.y }} onMove={handleMove}>
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
