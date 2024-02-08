import React from 'react';
import { GameObjectInterface, GameObjectItem, ModelItem, ParticleItem } from '../State/types';
import ModelTree from './ModelTree/ModelTree';
import { useStores } from '../State/store';
import styles from './Inspector.module.scss'
import Particle from './Particle';
import { observer } from 'mobx-react-lite';

type PropsType = {
  gameObject: GameObjectInterface
}

const GameObject: React.FC<PropsType> = observer(({
  gameObject,
}) => {
  const store = useStores()

  const handleDragOver: React.DragEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && ['model', 'particle'].includes(store.draggingItem.type)
    ) {
      event.dataTransfer.dropEffect = 'link';
    }
  }

  const handleDrop: React.DragEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && ['model', 'particle'].includes(store.draggingItem.type)
      && store.draggingItem.itemId !== null
    ) {
      switch (store.draggingItem.type) {
        case 'model':

          gameObject.items = [
            ...gameObject.items,
            { item: { id: store.draggingItem.itemId, materials: {} }, type: 'model' },
          ]
  
          break;

        case 'particle':

          gameObject.items = [
            ...gameObject.items,
            { item: { id: store.draggingItem.itemId }, type: 'particle' },
          ]

          gameObject.save()
          break;
      }
    }
  }

  const renderItem = (item: GameObjectItem) => {
    switch (item.type) {
      case 'model':
        return <ModelTree modelItem={item.item as ModelItem} />

      case 'particle':
        return <Particle particleItem={item.item as ParticleItem} />
    }

    return null;
  }

  return (
    <div className={styles.gameObject} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div>{`Name: ${gameObject.name}`}</div>
      {
        gameObject.items.map((item) => (
          renderItem(item)
        ))
      }
    </div>
  // <ModelTree />
  )
})

export default GameObject;
