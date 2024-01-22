import React from 'react';
import Node from './Node';
import { useStores } from './State/store';
import { observer } from 'mobx-react-lite';
import Canvas2d from './Canvas2d';
import ContextMenu from './ContextMenu/ContextMenu';
import Preview from './Preview';
import Controls from './Controls/Controls';
import Properties from './Properties';
import { menuItems } from './ContextMenu/MenuItems';
import { generateMaterial } from './Renderer/ShaderBuilder/ShaderBuilder';

const Container: React.FC = observer(() => {
  const { graph } = useStores();

  // Save the grpah every five seconds if there have been changes.
  React.useEffect(() => {
    const timer  = setInterval(() => {
      if (graph.changed) {
        const descriptor = graph.createMaterialDescriptor();
        localStorage.setItem('material', JSON.stringify(descriptor))
        graph.changed = false;  
      }
    }, 5000)

    return () => {
      clearInterval(timer);
    }
  }, [graph]);

  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      element.focus();
    }
  });

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

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.code === 'Backspace' && graph.selectedNode) {
      graph.deleteNode(graph.selectedNode);
    }
  }

  const handleClick = () => {
    graph.selectNode(null);
  }

  const handleSave = () => {
    const descriptor = graph.createMaterialDescriptor();

    fetch('/shaders/test.sg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(descriptor)
    })
  }

  const handleMakeMaterial = () => {
    const descriptor = graph.createMaterialDescriptor();
    const [code,, values] = generateMaterial(descriptor);
    
    fetch('/material/test.material', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        values,
      })
    })
  }

  const handleOpenShader = async () => {
    const response = await fetch('/shader-list');

    if (response.ok) {
      
    }
  }

  return (
    <div
      ref={ref}
      className="App"
      onContextMenu={handleContextMenu}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <div className="toolbar">
        <button type="button" className="save-button" onClick={handleSave}>Save</button>
        <button type="button" className="save-button" onClick={handleMakeMaterial}>Make Material</button>
        <button type="button" className="save-button" onClick={handleOpenShader}>Open</button>
      </div>
      <Canvas2d />
      {
        graph.nodes.map((gn) => (
          <Node key={gn.id} node={gn} parentRef={ref} />
        ))
      }
      <Preview />
      <Controls />
      <Properties />
      {
        showMenu
          ? <ContextMenu menuItems={menuItems} x={showMenu[0]} y={showMenu[1]} onClose={handleMenuClose} />
          : null
      }
    </div>
  )
})

export default Container;