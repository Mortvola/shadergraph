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

const menuItems = (): MenuItemLike[] => ([
  { name: 'Import texture...', action: () => {} },
  { name: 'Import model...', action: () => {} },
  { name: 'Create shader', action: () => {} },
  { name: 'Create game object', action: () => {} },
  { name: 'Create particle system', action: () => {} },
  { name: 'Create folder', action: () => { store.createFolder() } },
]);

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

  const handleEditorHide = () => {
    store.graph = null;
  }

  return (
    <div className={styles.main}>
      <div>
        {
          store.graph
          ? <ShaderEditor graph={store.graph} onHide={handleEditorHide} />
          : (
            <>
              <Canvas3d renderer={mainView} onWheel={handleWheel} />
              <Inspector />
            </>
          )
        }
      </div>
      <div className={styles.sidebar}>
        <button ref={ref} type="button" onClick={handleAddClick}>+</button>
        {
          showMenu
            ? <ContextMenu menuItems={menuItems} x={showMenu.x} y={showMenu.y} onClose={handleMenuClose} />
            : null
        }
        <Project />
      </div>
    </div>
  )
})

export default MainView;
