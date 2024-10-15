import React from 'react';
import type { MenuItemLike } from '../ContextMenu/types';
import { useStores } from '../State/store';
import ContextMenu from '../ContextMenu/ContextMenu';
import styles from '../Project/Project.module.scss'
import { SceneItemType, type SceneInterface } from "./Types/Types";

type PropsType = {
  scene?: SceneInterface,
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
    { name: 'Create scene object', action: async () => {
      if (scene) {
        scene.addNewItem(SceneItemType.SceneObject)
      }
    } },
    { name: 'Create particle system', action: async () => {
      if (scene) {
        scene.addNewItem(SceneItemType.ParticleSystem)
      }
    } },
    { name: 'Create light', action: async () => {
      if (scene) {
        scene.addNewItem(SceneItemType.Light)
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
