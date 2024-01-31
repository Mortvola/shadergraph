import React from 'react';
import styles from './MainView.module.scss';
import Canvas3d from './Canvas3d';
import { store, useStores } from './State/store';
import Inspector from './Inspector/Inspector';
import ContextMenu from './ContextMenu/ContextMenu';
import { MenuItemLike } from './ContextMenu/types';
import Project from './Project/Project';
import ShaderEditor from './ShaderEditor/ShaderEditor';
import { observer } from 'mobx-react-lite';
import ProjectItem from './Project/Types/ProjectItem';

const MainView: React.FC = observer(() => {
  const { mainView } = useStores();
  
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey) {
      mainView?.camera.changeOffset(event.deltaY * 0.01);
    }
    else {
      mainView?.camera.changeRotation(event.deltaX * 0.2)
    }

    event.stopPropagation();
  }

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
    { name: 'Create shader', action: () => { store.addNewItem('shader') } },
    { name: 'Create game object', action: () => { store.addNewItem('object') } },
    { name: 'Create particle system', action: () => { store.addNewItem('particle') } },
    { name: 'Create folder', action: () => { store.createFolder() } },
  ]), []);
  
  const handleTextureFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      store.importTexture(event.target.files[0])
    }
  }

  const handleModelFileSelection: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      store.importModel(event.target.files[0])
    }
  }

  return (
    <div className={styles.main}>
      <div>
        {
          store.graph
          ? <ShaderEditor graph={store.graph} />
          : (
            <>
              <Canvas3d renderer={mainView} onWheel={handleWheel} />
              <Inspector />
            </>
          )
        }
      </div>
      <div className={styles.sidebar}>
        <div>
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
        <Project />
      </div>
    </div>
  )
})

export default MainView;
