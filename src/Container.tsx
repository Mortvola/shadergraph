import React from 'react';
import Node from './Node';
import Canvas3d from './Canvas3d';
import { useStores } from './State/store';
import { observer } from 'mobx-react-lite';
import Canvas2d from './Canvas2d';
import ContextMenu from './ContextMenu/ContextMenu';

const Container: React.FC = observer(() => {
  const { graph } = useStores();

  const [showMenu, setShowMenu] = React.useState<[number, number] | null>(null);

  const handleContextMenu: React.MouseEventHandler = (event) => {
    console.log('context mnenu')
    if (!event.shiftKey) {
      event.preventDefault();
      setShowMenu([event.clientX, event.clientY]);
    }
  }

  const handleMenuClose = () => {
    setShowMenu(null)
  }

  return (
    <div className="App" onContextMenu={handleContextMenu}>
      <Canvas2d />
      {
        graph.nodes.map((gn) => (
          <Node node={gn} />
        ))
      }
      <div className="preview">
        <Canvas3d />
      </div>
      {
        showMenu
          ? <ContextMenu x={showMenu[0]} y={showMenu[1]} onClose={handleMenuClose} />
          : null
      }
    </div>
  )
})

export default Container;