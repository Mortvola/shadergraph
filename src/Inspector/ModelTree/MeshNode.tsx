import React from 'react';
import { ComponentType, DrawableComponentInterface } from '../../Renderer/Types';
import { useStores } from '../../State/store';
import { observer } from 'mobx-react-lite';
import styles from './ModelTree.module.scss';
import { SceneObjectInterface } from '../../State/types';

type PropsType = {
  node: DrawableComponentInterface,
  level: number,
  onMaterialAssignment: (node: DrawableComponentInterface, materialId: number) => void,
}

const MeshNode: React.FC<PropsType> = observer(({
  node,
  level,
  onMaterialAssignment,
}) => {
  const store = useStores()
  const { project: { selectedItem } } = store;

  let gameObject: SceneObjectInterface | null = null;
  if (selectedItem && selectedItem.type === 'object') {
    gameObject = selectedItem.item as SceneObjectInterface
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

  const handleDrop: React.DragEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && store.draggingItem.type === 'material'
      && store.draggingItem.itemId !== null
    ) {
      onMaterialAssignment(node, store.draggingItem.itemId)
    }
  }

  const renderMaterial = () => {
    // let name: string | undefined = '';

    if (gameObject) {
      const item = gameObject.components.find((o) => o.type === ComponentType.Mesh);

      if (item) {
        // const modelItem = item.item as ModelItem;

        // if (modelItem.materials) {
        //   const id = modelItem.materials[node.name];
    
        //   if (id !== undefined) {
        //     const item = store.project.getItemByItemId(id, 'material');
    
        //     name = item?.name
        //   }
        // }
    
        // if (name) {
        //   return (
        //     <div>{name}</div>
        //   )
        // }    
      }
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
