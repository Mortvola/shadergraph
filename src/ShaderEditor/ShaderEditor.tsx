import React from 'react';
import { observer } from 'mobx-react-lite';
import Canvas2d from './Canvas2d';
import ContextMenu from '../ContextMenu/ContextMenu';
import Preview from './Preview';
import Controls from './Controls/Controls';
import Properties from './Properties/Properties';
import { menuItems } from './MenuItems';
import Http from '../Http/src';
import Graph from './Graph';
import Toolbar from './Toolbar';
import { shaderGraphRenderer } from '../Main';
import type { GraphInterface } from '../State/GraphInterface';

type PropsType = {
  graph: GraphInterface,
  onHide?: () => void,
}

const ShaderEditor: React.FC<PropsType> = observer(({
  graph,
  onHide,
}) => {
  // Save the grpah every five seconds if there have been changes.
  React.useEffect(() => {
    const timer  = setInterval(() => {
      if (graph.changed) {
        const descriptor = graph.graph.createShaderDescriptor();
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
  }, []);

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

  const handleSave = async () => {
    const descriptor = graph.graph.createShaderDescriptor();

    if (graph.id !== null) {
      await Http.patch<unknown, void>(`/api/shader-descriptors/${graph.id}`, {
        name: graph.name,
        descriptor,
      })
    }
    else {
      const response = await Http.post<unknown, { id: number }>('/api/shader-descriptors', {
        name:  graph.name,
        descriptor,
      })

      if (response.ok) {
        const { id } = await response.body();

        graph.id = id;
      }
    }
  }

  const handleClose = () => {
    if (onHide) {
      onHide()
    }
  }

  return (
    <div
      ref={ref}
      className="shaderEditor"
      onContextMenu={handleContextMenu}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <Toolbar>
        <button type="button" onClick={handleSave}>Save</button>
        <button type="button" onClick={handleClose}>Close</button>
      </Toolbar>
      <Canvas2d renderer2d={shaderGraphRenderer}/>
      <Graph parent={ref} />
      <Preview />
      <Controls />
      <Properties graph={graph} />
      {
        showMenu
          ? <ContextMenu menuItems={menuItems} x={showMenu[0]} y={showMenu[1]} onClose={handleMenuClose} />
          : null
      }
    </div>
  )
})

export default ShaderEditor;