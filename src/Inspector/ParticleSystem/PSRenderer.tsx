import React from 'react';
import { observer } from 'mobx-react-lite';
import Renderer from '../../Renderer/ParticleSystem/Renderer';
import PSRenderModeTypeSelector from './PSRenderModeTypeSelector';
import { RenderMode } from '../../Renderer/ParticleSystem/Types';
import { materialManager } from '../../Renderer/Materials/MaterialManager';
import { useStores } from '../../State/store';

type PropsType = {
  value: Renderer,
}

const PSRenderer: React.FC<PropsType> = observer(({
  value,
}) => {
  const store = useStores();

  const handleModeChange = (mode: RenderMode) => {
    value.setRenderMode(mode);
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
      const materialItem = await materialManager.getItem(draggingItem.itemId, false)

      if (materialItem) {
        value.setMaterial(materialItem)
      }
    }
  }

  return (
    <>
      <label>
        Render Mode:
        <PSRenderModeTypeSelector value={value.mode} onChange={handleModeChange} />
      </label>
      <label onDragOver={handleDragOver} onDrop={handleDrop}>
        Material:
        <div>
          {
            value.material
              ? value.material.name
              : 'not assigned'
          }
        </div>
      </label>
    </>
  )
})

export default PSRenderer;
