import React from 'react';
import styles from './PropertyDialog.module.scss';
import { PropertyInterface } from '../Renderer/ShaderBuilder/Types';
import { observer } from 'mobx-react-lite';
import PropertyString from './PropertyString';
import { runInAction } from 'mobx';
import PropertyFloat from './PropertyFloat';
import PropertyVector from './PropertyVector';
import Modal from '../Modal';
import { GraphInterface } from '../State/types';
import PropertyTexture from './PropertyTexture';
import ValueInput from './ValueInput';

type PropsType = {
  graph: GraphInterface,
  property: PropertyInterface,
  x: number, 
  y: number,
  show: boolean,
  onHide: () => void,
}

const PropertyDialog: React.FC<PropsType> = observer(({
  graph,
  property,
  x,
  y,
  show,
  onHide,
}) => {
  const handlePointerDown: React.PointerEventHandler = (event) => {
    event.stopPropagation();
  }

  const handleClick: React.MouseEventHandler = (event) => {
    event.stopPropagation();
  }

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    event.stopPropagation();
  }

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    runInAction(() => {
      property.name = event.target.value;
      graph.changed = true;
    })
  }

  const handleDeleteClick = () => {
    graph.deleteProperty(property);
    onHide();
  }

  const handleValueChange = () => {
    graph.changed = true;
  }

  return (
    <Modal show={show} onHide={onHide}>
      <div
        className={styles.dialog}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        style={{ left: x, top: y }}
      >
        <div className={styles.property}>
          <input type="text" value={property.name} onChange={handleNameChange} />
          <ValueInput value={property.value} onChange={handleValueChange} />
        </div>
        <button type="button" onClick={handleDeleteClick}>X</button>
      </div>
    </Modal>
  )
})

export default PropertyDialog;
