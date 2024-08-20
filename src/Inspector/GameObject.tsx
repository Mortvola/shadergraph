import React from 'react';
import { GameObjectInterface, isGameObject2D } from '../State/types';
import ModelTree from './ModelTree/ModelTree';
import { useStores } from '../State/store';
import styles from './Inspector.module.scss'
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { ComponentType, DecalItem, GameObjectItem, LightItem, ModelItem, ParticleItem } from '../Renderer/types';
import GameObject2D from './GameObject2d';
import ContextMenu from '../ContextMenu/ContextMenu';
import { MenuItemLike } from '../ContextMenu/types';
import Decal from './Decal';
import Light from './Light';
import Particle from './ParticleSystem/Particle';

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
      const index = gameObject.items.findIndex((item) => (item.item as ModelItem).id === model.id)

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

  const handleDecalChange = (decal: DecalItem) => {
    runInAction(() => {
      const index = gameObject.items.findIndex((item) => item.item === decal)

      if (index !== -1) {
        gameObject.items = [
          ...gameObject.items.slice(0, index),
          { item: decal, type: 'decal' },
          ...gameObject.items.slice(index + 1),
        ]
  
        gameObject.save()
      }  
    })
  }

  const handleLightChange = (light: LightItem) => {
    runInAction(() => {
      const index = gameObject.items.findIndex((item) => item.item === light)

      if (index !== -1) {
        gameObject.items = [
          ...gameObject.items.slice(0, index),
          { item: light, type: 'light' },
          ...gameObject.items.slice(index + 1),
        ]
  
        gameObject.save()
      }  
    })
  }

  const handleDelete = (item: GameObjectItem) => {
    const index = gameObject.items.findIndex((i) => i.key === item.key)

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

      case 'decal':
        return <Decal decalItem={item.item as DecalItem} onChange={handleDecalChange} />

      case 'light':
        return <Light light={item.item as LightItem} onChange={handleLightChange} />  
    }

    return null;
  }

  const componentTypeName = (item: GameObjectItem) => {
    switch (item.type) {
      case 'model':
        return 'Model';

      case 'particle':
        return 'Particle System';

      case 'decal':
        return 'Decal';

      case 'light':
        return 'Light';
    }
  }

  const [showMenu, setShowMenu] = React.useState<{ x: number, y: number } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleAddClick = () => {
    if (!showMenu) {
      const element = buttonRef.current;

      if (element) {
        const rect = element.getBoundingClientRect();

        setShowMenu({ x: rect.left, y: rect.bottom })
      }
    }
  }

  const handleMenuClose = () => {
    setShowMenu(null);
  }

  const addComponent = React.useCallback((type: ComponentType) => {
    switch (type) {
      case 'decal':
        gameObject.items.push({ item: {}, type: 'decal' })
        gameObject.save()
        break;

      case 'light':
        gameObject.items.push({ item: { color: [1, 1, 1, 1], constant: 1, linear: 0.09, quadratic: 0.032 }, type: 'light' })
        gameObject.save()
        break;

      case 'model':
        gameObject.items.push({ item: { id: 0 }, type: 'model' }) 
        gameObject.save()
        break;

      case 'particle':
        gameObject.items.push({ item: { id: 0 }, type: 'particle' })
        gameObject.save()
        break;
    }
  }, [gameObject])

  const menuItems = React.useCallback((): MenuItemLike[] => ([
    { name: 'Model', action: () => { addComponent('model')} },
    { name: 'Particle System', action: () => { addComponent('particle') } },
    { name: 'Decal', action: () => {  addComponent('decal') } },
    { name: 'Light', action: () => { addComponent('light') } },
  ]), [addComponent]);

  return (
    <div className={styles.gameObject} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div>{`Name: ${gameObject.name}`}</div>
      {
        isGameObject2D(gameObject)
          ? (
            <GameObject2D gameObject={gameObject} />
          )
          : gameObject.items.map((item) => (
              <div className={styles.item} key={item.key ?? 0} >
                <div>
                  <button type="button" onClick={() => handleDelete(item)}>X</button>
                  { componentTypeName(item) }
                </div>
                {
                  renderItem(item)
                }
              </div>
        ))
      }
      <button ref={buttonRef} onClick={handleAddClick}>Add Component</button>
      {
        showMenu
          ? <ContextMenu menuItems={menuItems} x={showMenu.x} y={showMenu.y} onClose={handleMenuClose} />
          : null
      }
    </div>
  // <ModelTree />
  )
})

export default GameObject;
