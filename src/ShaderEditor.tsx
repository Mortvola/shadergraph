import React from 'react';
import { useStores } from './State/store';
import { observer } from 'mobx-react-lite';
import Canvas2d from './Canvas2d';
import ContextMenu from './ContextMenu/ContextMenu';
import Preview from './Preview';
import Controls from './Controls/Controls';
import Properties from './Properties';
import { menuItems } from './ContextMenu/MenuItems';
import { generateMaterial } from './Renderer/ShaderBuilder/ShaderBuilder';
import Http from './Http/src';
import GraphComponent from './Graph';
import { GraphInterface } from './State/types';

type PropsType = {
  graph: GraphInterface,
  onHide: () => void,
}

const ShaderEditor: React.FC<PropsType> = observer(({
  graph,
  onHide,
}) => {
  const store = useStores();
  
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
    const descriptor = graph.createMaterialDescriptor();

    if (graph.id !== null) {
      await Http.patch<unknown, void>(`/shader-descriptors/${graph.id}`, {
        name: graph.name,
        descriptor,
      })
    }
    else {
      const response = await Http.post<unknown, { id: number }>('/shader-descriptors', {
        name:  graph.name,
        descriptor,
      })

      if (response.ok) {
        const { id } = await response.body();

        graph.id = id;
      }
    }
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

  const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    graph.setName(event.target.value);
  }

  const handleClose = () => {
    onHide();
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
      <div className="toolbar">
        <button type="button" onClick={handleSave}>Save</button>
        <button type="button" onClick={handleMakeMaterial}>Make Material</button>
        <label>
          Name:
          <input value={graph.name} onChange={handleTitleChange} />
        </label>
        <button type="button" onClick={handleClose}>Close</button>
      </div>
      <Canvas2d />
      <GraphComponent parent={ref} />
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