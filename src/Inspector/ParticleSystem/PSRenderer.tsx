import React from 'react';
import { observer } from 'mobx-react-lite';
import type Renderer from '../../Renderer/ParticleSystem/Renderer';
import PSRenderModeTypeSelector from './PSRenderModeTypeSelector';
import { type RenderAlignment, RenderMode } from '../../Renderer/ParticleSystem/Types';
import { useStores } from '../../State/store';
import Property from '../Property';
import { ProjectItemType } from '../../Project/Types/types';
import PSRenderAlignmentSelector from './PSRenderAlignmentSelector copy';

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

  const handleRenderAlignmentChange = (mode: RenderAlignment) => {
    value.renderAlignment.set(mode, true);
  }

  const handleDragOver: React.DragEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && (store.draggingItem.type === ProjectItemType.Material
        || store.draggingItem.type === ProjectItemType.Model
      )
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
    ) {
      if (
        draggingItem
        && draggingItem.itemId !== null  
      ) {
        switch (draggingItem.type) {
          case ProjectItemType.Material:
            value.setMaterial(draggingItem.itemId)
            break;

          case ProjectItemType.Model:
            value.setMesh(draggingItem.itemId)
            break;
        }
      }
    }
  }

  return (
    <>
      <Property label="Render Mode" property={value.mode}>
        <PSRenderModeTypeSelector value={value.mode.get()} onChange={handleModeChange} />
      </Property>
      {
        value.mode.get() === RenderMode.Mesh
          ? (
            <Property label="Mesh" property={value.meshId} onDragOver={handleDragOver} onDrop={handleDrop}>
              <div>
                {
                  value.mesh
                    ? value.mesh.name
                    : 'not assigned'
                }
              </div>
            </Property>
          )
          : null
      }
      <Property label="Material" property={value.materialId} onDragOver={handleDragOver} onDrop={handleDrop}>
        <div>
          {
            value.material
              ? value.material.name
              : 'not assigned'
          }
        </div>
      </Property>
      <Property label="Render Alignment" property={value.mode}>
        <PSRenderAlignmentSelector value={value.renderAlignment.get()} onChange={handleRenderAlignmentChange} />
      </Property>
    </>
  )
})

export default PSRenderer;
