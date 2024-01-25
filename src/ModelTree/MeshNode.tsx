import React from 'react';
import { DrawableNodeInterface } from '../Renderer/types';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './ModelTree.module.scss';

type PropsType = {
  node: DrawableNodeInterface,
  level: number,
  onMaterialAssignment: (nodeName: string, materialId: number) => void,
}

const MeshNode: React.FC<PropsType> = observer(({
  node,
  level,
  onMaterialAssignment,
}) => {
  const { materials, selectedGameObject } = useStores();

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
      const materialId = parseInt(data);
      materials.applyMaterial(materialId, node)
      onMaterialAssignment(node.name, materialId)
    }
  }

  const renderMaterial = () => {
    let name: string | undefined = '';

    if (selectedGameObject && selectedGameObject.object.materials) {
      const id = selectedGameObject.object.materials[node.name];

      if (id !== undefined) {
        name = materials.getMaterialName(id);
      }
    }

    if (name) {
      return (
        <div>{name}</div>
      )
    }

    return null;
  }

  return (
    <div className={styles.mesh} style={{ marginLeft: 16 * level }} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div>
        {node.name ? node.name : 'Unnamed'}
      </div>
      <div>
        {'(Mesh)'}
      </div>
      {
        renderMaterial()
      }
    </div>
  )
})

export default MeshNode;
