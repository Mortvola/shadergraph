import React from 'react';
import { MenuItemLike } from '../ContextMenu/types';
import { useStores } from '../State/store';
import ContextMenu from '../ContextMenu/ContextMenu';
import styles from './Project.module.scss'

const ProjectToolbar: React.FC = () => {
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
    { name: 'Import texture...', action: () => {
      const inputElement = textureInputRef.current;

      if (inputElement) {
        inputElement.value = '';
        inputElement.click();
      }  
    } },
    { name: 'Import model...', action: () => {
      const inputElement = modelInputRef.current;

      if (inputElement) {
        inputElement.value = '';
        inputElement.click();
      }  
    } },
    { name: 'Create material', action: () => { store.project.addNewItem('material') } },
    { name: 'Create shader', action: () => { store.project.addNewItem('shader') } },
    { name: 'Create scene', action: () => { store.project.addNewItem('scene')}},
    { name: 'Create folder', action: () => { store.project.createFolder() } },
  ]), [store.project]);
  
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

export default ProjectToolbar;
