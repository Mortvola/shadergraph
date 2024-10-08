import React from 'react';
import type { SceneNodeBaseInterface } from "../Scene/Types/Types";
import { isGameObject2D } from '../State/types';
import { useStores } from '../State/store';
import styles from './Inspector.module.scss'
import { observer } from 'mobx-react-lite';
import type { NewSceneNodeComponent, SceneNodeComponent } from '../Renderer/Types';
import { ComponentType } from '../Renderer/Types';
import GameObject2D from './GameObject2d';
import ContextMenu from '../ContextMenu/ContextMenu';
import type { MenuItemLike } from '../ContextMenu/types';
import ParticleSystem from './ParticleSystem/ParticleSystem';
import ParticleSystemData from '../Renderer/ParticleSystem/ParticleSystem';
import LightComponent from './Light';
import Light from '../Renderer/Drawables/Light';
import ParticleSystemProps from '../Renderer/ParticleSystem/ParticleSystemProps';
import LightProps from '../Renderer/Properties/LightProps';
import Transform from './Transform';
import PopupButton from './PopupButton';
import Overrides from './Overrides';
import { Position } from './PopupWrapper';

type PropsType = {
  sceneNode: SceneNodeBaseInterface
}

const SceneNode: React.FC<PropsType> = observer(({
  sceneNode,
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
      // switch (store.draggingItem.type) {
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
      // }
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

  const handleDelete = (component: SceneNodeComponent) => {
    sceneNode.removeComponent(component);
  }

  const renderItem = (item: SceneNodeComponent) => {
    switch (item.type) {
      // case ComponentType.Mesh:
      //   return <ModelTree modelItem={item.item as ModelItem} onChange={handleModelChange} />

      case ComponentType.ParticleSystem:
        return <ParticleSystem particleSystemProps={(item.props as ParticleSystemProps)} />

      // case ComponentType.Decal:
      //   return <Decal decalItem={item.item as DecalItem} onChange={handleDecalChange} />

      case ComponentType.Light:
        return <LightComponent lightProps={item.props as LightProps} />  
    }

    return null;
  }

  const componentTypeName = (item: SceneNodeComponent) => {
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
        const component: NewSceneNodeComponent = {
          type: ComponentType.Light,
          props: props,
          component: light,
        };

        sceneNode.addComponent(component);
        break;
      }

      // case ComponentType.Mesh:
      //   sceneObject.items.push({ item: { id: 0, materials: {}, toDescriptor: () => { return { type: ComponentType.Mesh, props: {} } } }, type: ComponentType.Mesh }) 
      //   sceneObject.save()
      //   break;

      case ComponentType.ParticleSystem: {
        (async () => {
          const props = new ParticleSystemProps();
          const particleSystem = new ParticleSystemData(props);
  
          // particleSystemManager.add(particleSystem);
  
          const item: NewSceneNodeComponent = {
            type: ComponentType.ParticleSystem,
            props: props,
            component: particleSystem,
          }
  
          sceneNode.addComponent(item);  
        })()

        break;
      }
    }
  }, [sceneNode])

  const menuItems = React.useCallback((): MenuItemLike[] => ([
    { name: 'Model', action: () => { addComponent(ComponentType.Mesh)} },
    { name: 'Particle System', action: () => { addComponent(ComponentType.ParticleSystem) } },
    { name: 'Decal', action: () => {  addComponent(ComponentType.Decal) } },
    { name: 'Light', action: () => { addComponent(ComponentType.Light) } },
  ]), [addComponent]);

  return (
    <div className={styles.gameObject} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className={styles.title}>
        {`Name: ${sceneNode.name}`}
        <div>
          <button ref={buttonRef} onClick={handleAddClick}>Add Component</button>
          {
            sceneNode.isPrefabInstanceRoot()
              ? (
                <PopupButton label="Overrides" position={Position.top}>
                  <Overrides sceneNode={sceneNode} />
                </PopupButton>
              )
              : null
          }
        </div>
      </div>
      <div>
        <Transform transformProps={sceneNode.transformProps} />
        {
          isGameObject2D(sceneNode)
            ? (
              <GameObject2D gameObject={sceneNode} />
            )
            : sceneNode.components.map((component) => (
                <div className={styles.item} key={component.id ?? 0} >
                  <div className={styles.componentTitle}>
                    { componentTypeName(component) }
                    <button type="button" onClick={() => handleDelete(component)}>X</button>
                  </div>
                  {
                    renderItem(component)
                  }
                </div>
          ))
        }
      </div>
      {
        showMenu
          ? <ContextMenu menuItems={menuItems} x={showMenu.x} y={showMenu.y} onClose={handleMenuClose} />
          : null
      }
    </div>
  // <ModelTree />
  )
})

export default SceneNode;
