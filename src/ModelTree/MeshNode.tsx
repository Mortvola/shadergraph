import React from 'react';
import { DrawableNodeInterface } from '../Renderer/types';
import { useStores } from '../State/store';

type PropsType = {
  node: DrawableNodeInterface,
  level: number,
}

const MeshNode: React.FC<PropsType> = ({
  node,
  level,
}) => {
  const { materials } = useStores();

  const handleDragOver: React.DragEventHandler = (event) => {
    event.preventDefault();

    if (event.dataTransfer.types) {
      event.dataTransfer.dropEffect = 'link';
    }
  }

  const handleDrop: React.DragEventHandler = (event) => {
    event.preventDefault();

    const data = event.dataTransfer.getData("application/material");

    if (data) {
      console.log(`drop material: ${data}`)

      materials.applyMaterial(parseInt(data), node)
    }
  }

  return (
  <div style={{ marginLeft: 16 * level }} onDrop={handleDrop} onDragOver={handleDragOver}>
    {node.name ? node.name : 'Unnamed'}
    {'(Mesh)'}
  </div>
  )
}

export default MeshNode;
