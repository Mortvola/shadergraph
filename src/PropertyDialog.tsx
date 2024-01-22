import React from 'react';
import { createPortal } from 'react-dom';
import styles from './PropertyDialog.module.scss';
import { PropertyInterface } from './Renderer/ShaderBuilder/Types';
import { observer } from 'mobx-react-lite';
import PropertyString from './PropertyString';
import { useStores } from './State/store';
import { runInAction } from 'mobx';
import PropertyFloat from './PropertyFloat';

type PropsType = {
  property: PropertyInterface,
  x: number, 
  y: number,
  onHide: () => void,
}

const PropertyDialog: React.FC<PropsType> = observer(({
  property,
  x,
  y,
  onHide,
}) => {
  const { graph } = useStores();

  const handleWrapperClick = () => {
    onHide()
  }

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

  const renderValue = () => {
    switch (property.value.dataType) {
      case 'string':
      case 'texture2D':
        return <PropertyString node={property.value} />

      case 'float':
        return <PropertyFloat node={property.value} />
    }
  }

  const handleDeleteClick = () => {
    graph.deleteProperty(property);
    onHide();
  }

  return (
    createPortal(
      <div className={styles.wrapper} onClick={handleWrapperClick} onPointerDown={handlePointerDown}>
        <div
          className={styles.dialog}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          style={{ left: x, top: y }}
        >
          <div className={styles.property}>
            <input type="text" value={property.name} onChange={handleNameChange} />
            {
              renderValue()
            }
          </div>
          <button type="button" onClick={handleDeleteClick}>X</button>
        </div>
      </div>,
      document.body,
    )
  )
})

export default PropertyDialog;
