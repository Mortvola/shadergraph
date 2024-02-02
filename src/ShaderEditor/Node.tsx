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
import { renderer2d } from '../Main';

type PropsType = {
  graph: GraphInterface,
  node: GraphNodeInterface,
  parentRef: React.RefObject<HTMLElement>
  style?: React.CSSProperties,
}

const Node: React.FC<PropsType> = observer(({
  graph,
  node,
  parentRef,
  style,
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    graph.selectNode(node)
  }

  const handlePositionChange = (deltaX: number, deltaY: number) => {
    graph?.changeNodePosition(node, deltaX, deltaY);
  }

  const handleExpansionClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    setExpanded((prev) => !prev);
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


      setShowSettings({
        right: rect.right - renderer2d.translate[0],
        top: rect.bottom - renderer2d.translate[1] });
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
    <Draggable
      position={{ x: node.position!.x, y: node.position!.y }}
      onPositionChange={handlePositionChange}
      style={style}
    >
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
              transform: `translate(calc(-100% + ${renderer2d.translate[0]}px), ${renderer2d.translate[1]}px)`,
            }}
          />
        </Modal>
      </div>
    </Draggable>
  );
})

export default Node;
