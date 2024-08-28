import React from 'react';
import { SceneObjectInterface, isGameObject2D } from '../State/types';
import { useStores } from '../State/store';
import styles from './Inspector.module.scss'
import { observer } from 'mobx-react-lite';
import { ComponentType, SceneObjectComponent } from '../Renderer/types';
import GameObject2D from './GameObject2d';
import ContextMenu from '../ContextMenu/ContextMenu';
import { MenuItemLike } from '../ContextMenu/types';
import Particle from './ParticleSystem/Particle';
import NumberInput from './NumberInput';
import ParticleSystem from '../Renderer/ParticleSystem/ParticleSystem';
import LightComponent from './Light';
import Light from '../Renderer/Drawables/Light';
import ParticleSystemProps from '../Renderer/ParticleSystem/ParticleSystemProps';
import LightProps from '../Renderer/Drawables/LightProps';

type PropsType = {
  sceneObject: SceneObjectInterface
}

const SceneObject: React.FC<PropsType> = observer(({
  sceneObject,
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
      && ['model', 'particle'].includes(store.draggingItem.type)
      && store.draggingItem.itemId !== null
    ) {
      switch (store.draggingItem.type) {
        // case 'model':

        //   sceneObject.items = [
        //     ...sceneObject.items,
        //     {
        //       item: {
        //         id: store.draggingItem.itemId,
        //         materials: {},
        //         toDescriptor: () => {
        //           return { type: ComponentType.Mesh, props: {} } }
        //         },
        //       type: ComponentType.Mesh,
        //     },
        //   ]
  
        //   sceneObject.save()

        //   break;

        // case 'particle':

        //   sceneObject.items = [
        //     ...sceneObject.items,
        //     { item: { id: store.draggingItem.itemId }, type: ComponentType.ParticleSystem },
        //   ]

        //   sceneObject.save()
        //   break;
      }
    }
  }

  // const handleModelChange = (model: ModelItem) => {
    // runInAction(() => {
    //   const index = sceneObject.items.findIndex((item) => (item.item as ModelItem).id === model.id)

    //   if (index !== -1) {
    //     sceneObject.items = [
    //       ...sceneObject.items.slice(0, index),
    //       { item: model, type: ComponentType.Mesh },
    //       ...sceneObject.items.slice(index + 1),
    //     ]
  
    //     sceneObject.save()
    //   }  
    // })
  // }

  // const handleDecalChange = (decal: DecalItem) => {
    // runInAction(() => {
    //   const index = sceneObject.items.findIndex((item) => item.item === decal)

    //   if (index !== -1) {
    //     sceneObject.items = [
    //       ...sceneObject.items.slice(0, index),
    //       { item: decal, type: ComponentType.Decal },
    //       ...sceneObject.items.slice(index + 1),
    //     ]
  
    //     sceneObject.save()
    //   }  
    // })
  // }

  const handleDelete = (component: SceneObjectComponent) => {
    sceneObject.removeComponent(component);
  }

  const renderItem = (item: SceneObjectComponent) => {
    switch (item.type) {
      // case ComponentType.Mesh:
      //   return <ModelTree modelItem={item.item as ModelItem} onChange={handleModelChange} />

      case ComponentType.ParticleSystem:
        return <Particle particleSystemProps={(item.props as ParticleSystemProps)} />

      // case ComponentType.Decal:
      //   return <Decal decalItem={item.item as DecalItem} onChange={handleDecalChange} />

      case ComponentType.Light:
        return <LightComponent lightProps={item.props as LightProps} />  
    }

    return null;
  }

  const componentTypeName = (item: SceneObjectComponent) => {
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
      // case ComponentType.Decal:
      //   sceneObject.items.push({ item: { toDescriptor: () => { return { type: ComponentType.Decal, props: {} } }}, type: ComponentType.Decal })
      //   sceneObject.save()
      //   break;

      case ComponentType.Light: {
        const props = new LightProps()
        const light = new Light(props);
        const component: SceneObjectComponent = {
          type: ComponentType.Light,
          props: props,
          object: light,
        };

        sceneObject.addComponent(component);
        break;
      }

      // case ComponentType.Mesh:
      //   sceneObject.items.push({ item: { id: 0, materials: {}, toDescriptor: () => { return { type: ComponentType.Mesh, props: {} } } }, type: ComponentType.Mesh }) 
      //   sceneObject.save()
      //   break;

      case ComponentType.ParticleSystem: {
        (async () => {
          const props = await ParticleSystemProps.create();
          const particleSystem = new ParticleSystem(props);
  
          // particleSystemManager.add(particleSystem);
  
          const item: SceneObjectComponent = {
            type: ComponentType.ParticleSystem,
            props: props,
            object: particleSystem,
          }
  
          sceneObject.addComponent(item);  
        })()

        break;
      }
    }
  }, [sceneObject])

  const menuItems = React.useCallback((): MenuItemLike[] => ([
    { name: 'Model', action: () => { addComponent(ComponentType.Mesh)} },
    { name: 'Particle System', action: () => { addComponent(ComponentType.ParticleSystem) } },
    { name: 'Decal', action: () => {  addComponent(ComponentType.Decal) } },
    { name: 'Light', action: () => { addComponent(ComponentType.Light) } },
  ]), [addComponent]);

  const handleTranslateXChange = (x: number) => {
    sceneObject.transformProps.setTranslate([
      x,
      sceneObject.transformProps.translate[1],
      sceneObject.transformProps.translate[2],
    ])
  }

  const handleTranslateYChange = (y: number) => {
    sceneObject.transformProps.setTranslate([
      sceneObject.transformProps.translate[0],
      y,
      sceneObject.transformProps.translate[2],
    ])
  }

  const handleTranslateZChange = (z: number) => {
    sceneObject.transformProps.setTranslate([
      sceneObject.transformProps.translate[0],
      sceneObject.transformProps.translate[1],
      z,
    ])
  }

  return (
    <div className={styles.gameObject} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div>{`Name: ${sceneObject.name}`}</div>
      <div>
        Translate:
        <NumberInput value={sceneObject.transformProps.translate[0]} onChange={handleTranslateXChange} />
        <NumberInput value={sceneObject.transformProps.translate[1]} onChange={handleTranslateYChange} />
        <NumberInput value={sceneObject.transformProps.translate[2]} onChange={handleTranslateZChange} />
      </div>
      {
        isGameObject2D(sceneObject)
          ? (
            <GameObject2D gameObject={sceneObject} />
          )
          : sceneObject.components.map((item) => (
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
