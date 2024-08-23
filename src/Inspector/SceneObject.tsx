import React from 'react';
import { SceneObjectInterface, isGameObject2D } from '../State/types';
import ModelTree from './ModelTree/ModelTree';
import { useStores } from '../State/store';
import styles from './Inspector.module.scss'
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { ComponentType, DecalItem, GameObjectItem, LightInterface, ModelItem, ParticleItem } from '../Renderer/types';
import GameObject2D from './GameObject2d';
import ContextMenu from '../ContextMenu/ContextMenu';
import { MenuItemLike } from '../ContextMenu/types';
import Decal from './Decal';
import Particle from './ParticleSystem/Particle';
import NumberInput from './NumberInput';
import ParticleSystem from '../Renderer/ParticleSystem/ParticleSystem';
import { particleSystemManager } from '../Renderer/ParticleSystem/ParticleSystemManager';
import LightComponent from './Light';
import Light from '../Renderer/Drawables/Light';

type PropsType = {
  gameObject: SceneObjectInterface
}

const SceneObject: React.FC<PropsType> = observer(({
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
            { item: { id: store.draggingItem.itemId, materials: {} }, type: ComponentType.Mesh },
          ]
  
          gameObject.save()

          break;

        case 'particle':

          gameObject.items = [
            ...gameObject.items,
            { item: { id: store.draggingItem.itemId }, type: ComponentType.Mesh },
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
          { item: model, type: ComponentType.Mesh },
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
          { item: decal, type: ComponentType.Decal },
          ...gameObject.items.slice(index + 1),
        ]
  
        gameObject.save()
      }  
    })
  }

  const handleLightChange = (light: LightInterface) => {
    runInAction(() => {
      const index = gameObject.items.findIndex((item) => item.item === light)

      if (index !== -1) {
        gameObject.items = [
          ...gameObject.items.slice(0, index),
          { item: light, type: ComponentType.Light },
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
      case ComponentType.Mesh:
        return <ModelTree modelItem={item.item as ModelItem} onChange={handleModelChange} />

      case ComponentType.ParticleSystem:
        return <Particle particleItem={item.item as ParticleItem} />

      case ComponentType.Decal:
        return <Decal decalItem={item.item as DecalItem} onChange={handleDecalChange} />

      case ComponentType.Light:
        return <LightComponent light={item.item as LightInterface} onChange={handleLightChange} />  
    }

    return null;
  }

  const componentTypeName = (item: GameObjectItem) => {
    switch (item.type) {
      case ComponentType.Mesh:
        return 'Model';

      case ComponentType.ParticleSystem:
        return 'Particle System';

      case ComponentType.Decal:
        return 'Decal';

      case ComponentType.Light:
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
      case ComponentType.Decal:
        gameObject.items.push({ item: {}, type: ComponentType.Decal })
        gameObject.save()
        break;

      case ComponentType.Light: {
        const light: GameObjectItem = {
          item: new Light(),
          type: ComponentType.Light
        };

        gameObject.addComponent(light);
        break;
      }

      case ComponentType.Mesh:
        gameObject.items.push({ item: { id: 0 }, type: ComponentType.Mesh }) 
        gameObject.save()
        break;

      case ComponentType.ParticleSystem: {
        (async () => {
          const particleSystem = await ParticleSystem.create(-1);
  
          particleSystemManager.add(particleSystem);
  
          const item: GameObjectItem = {
            key: particleSystem.id,
            type: ComponentType.ParticleSystem,
            item: {
              id: particleSystem.id
            }
          }
  
          gameObject.addComponent(item);  
        })()

        break;
      }
    }
  }, [gameObject])

  const menuItems = React.useCallback((): MenuItemLike[] => ([
    { name: 'Model', action: () => { addComponent(ComponentType.Mesh)} },
    { name: 'Particle System', action: () => { addComponent(ComponentType.ParticleSystem) } },
    { name: 'Decal', action: () => {  addComponent(ComponentType.Decal) } },
    { name: 'Light', action: () => { addComponent(ComponentType.Light) } },
  ]), [addComponent]);

  return (
    <div className={styles.gameObject} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div>{`Name: ${gameObject.name}`}</div>
      <div>
        Translate:
        <NumberInput value={gameObject.translate[0]} />
        <NumberInput value={gameObject.translate[1]} />
        <NumberInput value={gameObject.translate[2]} />
      </div>
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

export default SceneObject;
