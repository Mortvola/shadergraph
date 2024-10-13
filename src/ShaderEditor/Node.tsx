import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Node.module.scss';
import NodeInputPort from './NodeInputPort';
import NodeOutputPort from './NodeOutputPort';
import type { GraphNodeInterface} from '../Renderer/ShaderBuilder/Types';
import { isDisplaySettings, isPropertyNode, isValueNode } from '../Renderer/ShaderBuilder/Types';
import Draggable from './Draggable';
import ValueInput from './Properties/ValueInput';
import Modal from '../Widgets/Modal';
import SampleTextureSettings from './SampleTextureSettings';
import type SampleTexture from '../Renderer/ShaderBuilder/Nodes/SampleTexture';
import type { GraphInterface } from '../State/GraphInterface';
import { SettingsIcon } from 'lucide-react';
import type Display from '../Renderer/ShaderBuilder/Nodes/Display';
import DisplaySettings from './DisplaySettings';

type PropsType = {
  graph: GraphInterface,
  node: GraphNodeInterface,
  parentRef: React.RefObject<HTMLElement>
  style?: React.CSSProperties,
  translate?: { x: number, y: number },
  scale?: number,
  origin?: { x: number, y: number },
}

const Node: React.FC<PropsType> = observer(({
  graph,
  node,
  parentRef,
  style,
  translate = { x: 0, y: 0},
  scale = 1,
  origin = { x: 0, y: 0},
}) => {
  // const [expanded, setExpanded] = React.useState<boolean>(node.inputPorts.some((ip) => ip.edge));
  const [expanded, setExpanded] = React.useState<boolean>(true);

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
  const buttonRef = React.useRef<HTMLDivElement>(null)

  const handleSettingsClick = () => {
    const element = buttonRef.current

    if (element) {
      const rect = element.getBoundingClientRect()


      setShowSettings({
        right: rect.right - translate.x,
        top: rect.bottom - translate.y,
      });
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
                <NodeOutputPort
                  key={p.name}
                  port={p}
                  hideName
                  translate={translate}
                  scale={scale}
                  origin={origin}            
                />
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
            <NodeOutputPort
              key={node.outputPort[0].name}
              port={node.outputPort[0]}
              hideName
              translate={translate}
              scale={scale}
              origin={origin}
            />
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
                ? <div ref={buttonRef} onClick={handleSettingsClick}><SettingsIcon /></div>
                : null
            }
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.inputports}>
            {
              node.inputPorts.map((p) => (
                <NodeInputPort
                  graph={graph}
                  key={p.name}
                  parentRef={parentRef}
                  port={p}
                  translate={translate}
                  scale={scale}
                  origin={origin}            
                />
              ))
            }
          </div>
          <div className={styles.outputports}>
            {
              node.outputPort.map((p) => (
                <NodeOutputPort
                  key={p.name}
                  port={p}
                  translate={translate}
                  scale={scale}
                  origin={origin}
                />
              ))
            }
          </div>
        </div>
      </>      
    )
  }

  // console.log(scale)

  return (
    <Draggable
      position={{ x: node.position!.x, y: node.position!.y }}
      onPositionChange={handlePositionChange}
      style={style}
      translate={translate}
      scale={scale}
      origin={origin}
    >
      <div
        className={`${styles.node} ${node === graph.selectedNode ? styles.selected : ''}`}
        onPointerDown={handlePointerDown}
      >
        {
          renderNode()
        }
        <Modal show={showSettings !== null} onHide={handleSettingsHide}>
          {
            isDisplaySettings(node.settings)
              ? (
                <DisplaySettings
                  node={node as Display}
                  style={{
                    left: showSettings?.right,
                    top: showSettings?.top,
                    transform: `translate(calc(-100% + ${translate.x}px), ${translate.y}px)`,
                  }}
                />
              )
              : (
                <SampleTextureSettings
                  node={node as SampleTexture}
                  style={{
                    left: showSettings?.right,
                    top: showSettings?.top,
                    transform: `translate(calc(-100% + ${translate.x}px), ${translate.y}px)`,
                  }}
                />    
              )
          }
        </Modal>
      </div>
    </Draggable>
  );
})

export default Node;
