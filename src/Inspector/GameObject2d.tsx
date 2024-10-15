import React from 'react'
import type { GameObject2DInterface } from '../State/types';
import { useStores } from '../State/store';

type PropsType = {
  gameObject: GameObject2DInterface,
}

const GameObject2D: React.FC<PropsType> = ({
  gameObject,
}) => {
  const store = useStores()

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
      gameObject.material = store.draggingItem.itemId

      gameObject.save()
    }
  }
  return (
    <label>
      Material:
      <div onDragOver={handleDragOver} onDrop={handleDrop}>{gameObject.material ?? 'None'}</div>
    </label>
  )
}

export default GameObject2D;
