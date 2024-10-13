import React from 'react';
import styles from './PortConnector.module.scss'
import { type OutputPortInterface, type InputPortInterface } from '../Renderer/ShaderBuilder/Types';

type PropsType = {
  port: InputPortInterface | OutputPortInterface,
  draggable?: boolean,
  onDragStart?: React.DragEventHandler<HTMLDivElement>
  onDragEnd?: React.DragEventHandler<HTMLDivElement>
  onDrag?: React.DragEventHandler<HTMLDivElement>
}

const PortConnector: React.FC<PropsType> = ({
  port,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDrag,
}) => (
  <div
    className={styles.connectorWrapper}
    onDragStart={onDragStart}
    onDrag={onDrag}
    onDragEnd={onDragEnd}
    draggable={draggable}
  >
    <div
      className={`${styles.connector} ${port.connected() ? styles.connected : ''}`}
    />
  </div>
)

export default PortConnector;
