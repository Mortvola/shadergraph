import React from 'react';
import { observer } from 'mobx-react-lite';
import Renderer from '../../Renderer/ParticleSystem/Renderer';
import PSRenderModeTypeSelector from './PSRenderModeTypeSelector';
import { RenderMode } from '../../Renderer/ParticleSystem/Types';
import { materialManager } from '../../Renderer/Materials/MaterialManager';
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
      const materialItem = await materialManager.getItem(draggingItem.itemId, false)

      if (materialItem) {
        // value.material.set(materialItem, true)
      }
    }
  }

  return (
    <>
      <Property label="Render Mode" property={value.mode}>
        <PSRenderModeTypeSelector value={value.mode.get()} onChange={handleModeChange} />
      </Property>
      {/* <Property label="Material" property={value.material} onDragOver={handleDragOver} onDrop={handleDrop}>
        <div>
          {
            value.material
              ? value.material.get()?.name
              : 'not assigned'
          }
        </div>
      </Property> */}
    </>
  )
})

export default PSRenderer;
