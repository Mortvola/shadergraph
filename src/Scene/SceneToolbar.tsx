import React from 'react';
import { MenuItemLike } from '../ContextMenu/types';
import { useStores } from '../State/store';
import ContextMenu from '../ContextMenu/ContextMenu';
import styles from '../Project/Project.module.scss'
import Scene from './Types/Scene';
import SceneObject from '../State/SceneObject';
import ParticleSystem from '../Renderer/ParticleSystem/ParticleSystem';
import { particleSystemManager } from '../Renderer/ParticleSystem/ParticleSystemManager';
import { ComponentType, GameObjectItem } from '../Renderer/types';
import Light from '../Renderer/Drawables/Light';

type PropsType = {
  scene?: Scene,
}

const SceneToolbar: React.FC<PropsType> = ({
  scene,
}) => {
  const store = useStores();

  const [showMenu, setShowMenu] = React.useState<{ x: number, y: number } | null>(null);
  const ref = React.useRef<HTMLButtonElement>(null);

  const handleAddClick = () => {
    if (!showMenu) {
      const element = ref.current;

      if (element) {
        const rect = element.getBoundingClientRect();

        setShowMenu({ x: rect.left, y: rect.bottom })
      }
    }
  }

  const handleMenuClose = () => {
    setShowMenu(null);
  }

  const textureInputRef = React.useRef<HTMLInputElement>(null);
  const modelInputRef = React.useRef<HTMLInputElement>(null);

  const menuItems = React.useCallback((): MenuItemLike[] => ([
    { name: 'Create scene object', action: () => {
      if (scene) {
        const object = new SceneObject()
        scene.addObject(object);  
      }
    } },
    { name: 'Create particle system', action: async () => {
      if (scene) {
        const object = new SceneObject()

        const particleSystem = await ParticleSystem.create(-1);
  
        particleSystemManager.add(particleSystem);

        const item: GameObjectItem = {
          key: particleSystem.id,
          type: ComponentType.ParticleSystem,
          item: {
            id: particleSystem.id
          }
        }

        object.addComponent(item);
  
        scene.addObject(object);  
      }
    } },
    { name: 'Create light', action: async () => {
      if (scene) {
        const object = new SceneObject()

        const light = new Light();

        const item: GameObjectItem = {
          type: ComponentType.Light,
          item: light,
        }

        object.addComponent(item);

        scene.addObject(object);
      }
    } }

    // { name: 'Create 2D game object', action: () => { store.project.addNewItem('object2D') } },
    // { name: 'Create particle system', action: () => { store.project.addNewItem('particle') } },
    // { name: 'Create folder', action: () => { store.project.createFolder() } },
  ]), [scene]);
  
  const handleTextureFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      store.project.importTexture(event.target.files[0])
    }
  }

  const handleModelFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      store.project.importModel(event.target.files[0])
    }
  }

  return (
    <div className={styles.toolbar}>
      <button ref={ref} type="button" onClick={handleAddClick}>+</button>
      <input
        ref={textureInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".png"
        // multiple={multiple}
        onChange={handleTextureFileSelection}
      />
      <input
        ref={modelInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".fbx"
        // multiple={multiple}
        onChange={handleModelFileSelection}
      />
      {
        showMenu
          ? <ContextMenu menuItems={menuItems} x={showMenu.x} y={showMenu.y} onClose={handleMenuClose} />
          : null
      }
    </div>
  )
}

export default SceneToolbar;
