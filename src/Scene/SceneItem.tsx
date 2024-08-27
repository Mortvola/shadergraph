import React from 'react';
import styles from './SceneItem.module.scss';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import ContextMenu from '../ContextMenu/ContextMenu';
import { MenuItemLike } from '../ContextMenu/types';
// import Http from '../Http/src';
import { SceneInterface, SceneObjectInterface } from '../State/types';
// import Graph from '../State/Graph';
// import { runInAction } from 'mobx';
// import ProjectItemObject from "../Project/Types/ProjectItem";
// import { shaderManager } from '../Renderer/shaders/ShaderManager';

type PropsType = {
  project: SceneInterface,
  item: SceneObjectInterface,
  onSelect?: (item: SceneObjectInterface) => void,
  selected: boolean,
  draggable?: boolean,
}

const SceneItem: React.FC<PropsType> = observer(({
  project,
  item,
  onSelect,
  selected,
  draggable = false,
}) => {
  const store = useStores();

  const handleClick = () => {
    if (onSelect) {
      onSelect(item)
    }
  }

  const handleDragStart: React.DragEventHandler = (event) => {
    event.dataTransfer.clearData();
    event.dataTransfer.setData("application/scene-item", item.id.toString());

    project.draggingItem = item;
  }

  const handleDrag = () => {

  }

  const handleDragEnd = () => {
    project.draggingItem = null;
  }

  const [editing, setEditing] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>(item.name);

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.code === 'Enter') {
      setEditing((prev) => {
        if (prev) {
          item.changeName(name)
        }

        return !prev
      });
    }
    else if (event.code === 'Escape') {
      setEditing(false);
    }
  }

  const handleBlur = () => {
    setEditing(false);
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value)
  }

  const [showMenu, setShowMenu] = React.useState<{ x: number, y: number } | null>(null);

  const menuItems = React.useCallback((): MenuItemLike[] => {
    const items: MenuItemLike[] = [
      // { name: 'Delete', action: () => { item.delete() } },
    ];

    // if (item.type === 'shader') {
    //   items.push({
    //     name: 'Create Material',
    //     action: async () => {
    //       if (!item.item && item.itemId) {
    //         const descriptor = await shaderManager.getDescriptor(item.itemId)

    //         runInAction(() => {
    //           item.item = new Graph(store, item.itemId!, item.name, descriptor);    
    //         })
    //       }

    //       if (item.item) {
    //         const response = await Http.post<unknown, ProjectItemRecord>('/materials', {
    //           name: `${item.name} Material`,
    //           shaderId: item.itemId,
    //           properties: (item.item as Graph).graph.properties,    
    //         })

    //         if (response) {
    //           const rec = await response.json()

    //           const newItem = new ProjectItemObject(rec.id, rec.name, rec.type as ProjectItemType, item.parent, rec.itemId);

    //           (item.parent as FolderInterface).addItem(newItem)
        
    //           runInAction(() => {
    //             store.selectItem(newItem);
    //           })
    //         }
    //       }
    //     },
    //   })      
    // }
    
    return items;
  }, []);
  
  const handleContextMenu: React.MouseEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    setShowMenu({ x: event.clientX, y: event.clientY })
  }

  const handleMenuClose = () => {
    setShowMenu(null);
  }

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    event.target.select();
  }

  return (
    <div
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onContextMenu={handleContextMenu}
    >
      {
        editing
          ? <input type="text" value={name} onBlur={handleBlur} onChange={handleChange} autoFocus onFocus={handleFocus} />
          : `${item.name}`
      }
      {
        showMenu
          ? <ContextMenu menuItems={menuItems} x={showMenu.x} y={showMenu.y} onClose={handleMenuClose} />
          : null
      }
    </div>
  )
})

export default SceneItem;
