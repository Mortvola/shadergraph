import React from 'react';
import Node from './Node';
import Canvas3d from './Canvas3d';
import { useStores } from './State/store';
import { observer } from 'mobx-react-lite';
import Canvas2d from './Canvas2d';
import ContextMenu from './ContextMenu/ContextMenu';

const Container: React.FC = observer(() => {
  const { graph } = useStores();

  // Save the grpah every five seconds if there have been changes.
  React.useEffect(() => {
    const timer  = setInterval(() => {
      if (graph.changed) {
        const descriptor = graph.createDescriptor();
        localStorage.setItem('graph', JSON.stringify(descriptor))
        graph.changed = false;  
      }
    }, 5000)

    return () => {
      clearInterval(timer);
    }
  }, [graph]);

  const [showMenu, setShowMenu] = React.useState<[number, number] | null>(null);

  const handleContextMenu: React.MouseEventHandler = (event) => {
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
          <Node key={gn.id} node={gn} />
        ))
      }
      <div className="preview">
        <button type="button">Upload</button>
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