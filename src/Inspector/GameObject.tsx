import React from 'react';
import { GameObjectInterface, isGameObject2D } from '../State/types';
import ModelTree from './ModelTree/ModelTree';
import { useStores } from '../State/store';
import styles from './Inspector.module.scss'
import Particle from './Particle';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { GameObjectItem, ModelItem, ParticleItem } from '../Renderer/types';
import GameObject2D from './GameObject2d';

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
  
          gameObject.save()

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

  const handleModelChange = (model: ModelItem) => {
    runInAction(() => {
      const index = gameObject.items.findIndex((item) => item.item.id === model.id)

      if (index !== -1) {
        gameObject.items = [
          ...gameObject.items.slice(0, index),
          { item: model, type: 'model' },
          ...gameObject.items.slice(index + 1),
        ]
  
        gameObject.save()
      }  
    })
  }

  const handleDelete = (item: GameObjectItem) => {
    const index = gameObject.items.findIndex((i) => i.item.id === item.item.id && i.type === item.type)

    if (index !== -1) {
      gameObject.items = [
        ...gameObject.items.slice(0, index),
        ...gameObject.items.slice(index + 1),
      ]

      gameObject.save()
    }
  }

  const renderItem = (item: GameObjectItem) => {
    switch (item.type) {
      case 'model':
        return <ModelTree modelItem={item.item as ModelItem} onChange={handleModelChange} />

      case 'particle':
        return <Particle particleItem={item.item as ParticleItem} />
    }

    return null;
  }

  return (
    <div className={styles.gameObject} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div>{`Name: ${gameObject.name}`}</div>
      {
        isGameObject2D(gameObject)
          ? (
            <GameObject2D gameObject={gameObject} />
          )
          : gameObject.items.map((item) => (
              <div className={styles.item} key={`${item.item.id}:${item.type}`} >
                <button type="button" onClick={() => handleDelete(item)}>X</button>
                {
                  renderItem(item)
                }
              </div>
        ))
      }
    </div>
  // <ModelTree />
  )
})

export default GameObject;
