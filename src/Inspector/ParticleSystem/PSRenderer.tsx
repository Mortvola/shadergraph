import React from 'react';
import { observer } from 'mobx-react-lite';
import type Renderer from '../../Renderer/ParticleSystem/Renderer';
import PSRenderModeTypeSelector from './PSRenderModeTypeSelector';
import type { RenderMode } from '../../Renderer/ParticleSystem/Types';
import { useStores } from '../../State/store';
import Property from '../Property';

type PropsType = {
  value: Renderer,
}

const PSRenderer: React.FC<PropsType> = observer(({
  value,
}) => {
  const store = useStores();

  const handleModeChange = (mode: RenderMode) => {
    value.mode.set(mode, true);
  }

  const handleDragOver: React.DragEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && store.draggingItem.type === 'material'
    ) {
      event.dataTransfer.dropEffect = 'link';
    }
    else {
      event.dataTransfer.dropEffect = 'none';
    }
  }

  const handleDrop: React.DragEventHandler = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const draggingItem = store.draggingItem;

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && draggingItem
      && draggingItem.type === 'material'
      && draggingItem.itemId !== null
    ) {
      value.setMaterial(draggingItem.itemId)
    }
  }

  return (
    <>
      <Property label="Render Mode" property={value.mode}>
        <PSRenderModeTypeSelector value={value.mode.get()} onChange={handleModeChange} />
      </Property>
      <Property label="Material" property={value.materialId} onDragOver={handleDragOver} onDrop={handleDrop}>
        <div>
          {
            value.material
              ? value.material.name
              : 'not assigned'
          }
        </div>
      </Property>
    </>
  )
})

export default PSRenderer;
