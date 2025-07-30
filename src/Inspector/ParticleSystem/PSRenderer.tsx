import React from 'react';
import { observer } from 'mobx-react-lite';
import type Renderer from '../../Renderer/ParticleSystem/Renderer';
import PSRenderModeTypeSelector from './PSRenderModeTypeSelector';
import { type RenderAlignment, RenderMode } from '../../Renderer/ParticleSystem/Types';
import { useStores } from '../../State/store';
import Property from '../Property';
import { ProjectItemType } from '../../Project/Types/types';
import PSRenderAlignmentSelector from './PSRenderAlignmentSelector copy';
import type SceneNode from '../../Scene/Types/SceneNode';
import { ComponentType } from '../../Renderer/Types';

type PropsType = {
  value: Renderer,
  sceneNode: SceneNode,
}

const PSRenderer: React.FC<PropsType> = observer(({
  value,
  sceneNode,
}) => {
  const store = useStores();

  const handleModeChange = (mode: RenderMode) => {
    value.mode.set(mode, !sceneNode.isTopLevel);
  }

  const handleRenderAlignmentChange = (mode: RenderAlignment) => {
    value.renderAlignment.set(mode, !sceneNode.isTopLevel);
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

  const getMeshName = () => {
    const meshId = value.meshId.get()
    if (meshId !== undefined) {
      const item = store.project.getItemByItemId(meshId, ProjectItemType.Model)

      if (item) {
        return item.name
      }

      return meshId
    }

    return 'not assigned'
  }

  const getMaterialName = () => {
    const materialId = value.materialId.get()
    if (materialId !== undefined) {
      const item = store.project.getItemByItemId(materialId, ProjectItemType.Material)

      if (item) {
        return item.name
      }

      return materialId
    }

    return 'not assigned'
  }

  return (
    <>
      <Property
        label="Render Mode"
        property={value.mode}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="mode"
      >
        <PSRenderModeTypeSelector value={value.mode.get()} onChange={handleModeChange} />
      </Property>
      {
        value.mode.get() === RenderMode.Mesh
          ? (
            <Property
              label="Mesh"
              property={value.meshId}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              sceneNode={sceneNode}
              componentType={ComponentType.ParticleSystem}
              propertyPath="meshId"
            >
              <div>
                {
                  getMeshName()
                }
              </div>
            </Property>
          )
          : null
      }
      <Property
        label="Material"
        property={value.materialId}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="materialId"
      >
        <div>
          {
            getMaterialName()
          }
        </div>
      </Property>
      <Property
        label="Render Alignment"
        property={value.mode}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="mode"
      >
        <PSRenderAlignmentSelector value={value.renderAlignment.get()} onChange={handleRenderAlignmentChange} />
      </Property>
    </>
  )
})

export default PSRenderer;
