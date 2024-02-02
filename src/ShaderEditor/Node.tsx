import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Node.module.scss';
import NodeInputPort from './NodeInputPort';
import NodeOutputPort from './NodeOutputPort';
import { GraphNodeInterface, isPropertyNode, isValueNode } from '../Renderer/ShaderBuilder/Types';
import Draggable from './Draggable';
import { GraphInterface } from '../State/types';
import ValueInput from './ValueInput';
import Modal from '../Modal';
import SampleTextureSettings from './SampleTextureSettings';
import SampleTexture from '../Renderer/ShaderBuilder/Nodes/SampleTexture';

type PropsType = {
  graph: GraphInterface,
  node: GraphNodeInterface,
  parentRef: React.RefObject<HTMLElement>
}

const Node: React.FC<PropsType> = observer(({
  graph,
  node,
  parentRef,
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    graph.selectNode(node)
  }

  const handleMove = (x: number, y: number) => {
    graph?.setNodePosition(node, x, y);
  }

  const handleExpansionClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    setExpanded((prev) => !prev);
    console.log(expanded);
    event.stopPropagation();
  }

  const handlePointerDown2: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleValueChange = () => {
    graph.changed = true;
  }

  const [showSettings, setShowSettings] = React.useState<{ right: number, top: number } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const handleSettingsClick = () => {
    const element = buttonRef.current

    if (element) {
      const rect = element.getBoundingClientRect()


      setShowSettings({ right: rect.right, top: rect.bottom });
    }
  }

  const handleSettingsHide = () => {
    setShowSettings(null);
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
      return (
        <>
          <div className={styles.value}>
            <ValueInput value={node.value} onChange={handleValueChange} />
            <div onClick={handleExpansionClick} onPointerDown={handlePointerDown2}>V</div>
            <NodeOutputPort key={node.outputPort[0].name} port={node.outputPort[0]} hideName />
          </div>
        </>
      )
    }

    return (
      <>
        <div className={styles.title}>
          <div>{node.getName()}</div>
          <div  onPointerDown={handlePointerDown2}>
            {
              node.settings
                ? <button ref={buttonRef} type="button" onClick={handleSettingsClick}>*</button>
                : null
            }
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.inputports}>
            {
              node.inputPorts.map((p) => (
                <NodeInputPort graph={graph} key={p.name} parentRef={parentRef} port={p} />
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
        <Modal show={showSettings !== null} onHide={handleSettingsHide}>
          <SampleTextureSettings
            node={node as SampleTexture}
            style={{
              left: showSettings?.right,
              top: showSettings?.top,
              transform: 'translate(-100%, 0)',
            }}
          />
        </Modal>
      </div>
    </Draggable>
  );
})

export default Node;
