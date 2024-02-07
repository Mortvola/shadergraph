import React from 'react';
import { FolderInterface, ProjectItemInterface, ShaderRecord } from './Types/types';
import styles from './ProjectItem.module.scss';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import ContextMenu from '../ContextMenu/ContextMenu';
import { MenuItemLike } from '../ContextMenu/types';
import Http from '../Http/src';
import { ProjectItemRecord } from '../State/types';
import Graph from '../State/Graph';
import { runInAction } from 'mobx';
import ProjectItemObject from "../Project/Types/ProjectItem";

type PropsType = {
  item: ProjectItemInterface,
  onSelect: (item: ProjectItemInterface) => void,
  selected: boolean,
  draggable?: boolean,
}

const ProjectItem: React.FC<PropsType> = observer(({
  item,
  onSelect,
  selected,
  draggable = false,
}) => {
  const store = useStores();

  const handleClick = () => {
    onSelect(item)
  }

  const handleDragStart: React.DragEventHandler = (event) => {
    event.dataTransfer.clearData();
    event.dataTransfer.setData("application/project-item", item.id.toString());

    store.draggingItem = item;
  }

  const handleDrag = () => {

  }

  const handleDragEnd = () => {
    store.draggingItem = null;
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
    const items = [
      { name: 'Delete', action: () => { item.delete() } },
    ];

    if (item.type === 'shader') {
      items.push({
        name: 'Create Material',
        action: async () => {
          if (!item.item) {
            const response = await Http.get<ShaderRecord>(`/shader-descriptors/${item.itemId}`)

            if (response.ok) {
              const descriptor = await response.body();
    
              runInAction(() => {
                item.item = new Graph(store, descriptor.id, descriptor.name, descriptor.descriptor);    
              })
            }      
          }

          if (item.item) {
            const response = await Http.post<unknown, ProjectItemRecord>('/materials', {
              name: `${item.name} Material`,
              shaderId: item.itemId,
              properties: (item.item as Graph).properties,    
            })

            if (response) {
              const rec = await response.json()

              const newItem = new ProjectItemObject(rec.id, rec.name, rec.type, item.parent, rec.itemId);

              (item.parent as FolderInterface).addItem(newItem)
        
              runInAction(() => {
                store.selectItem(newItem);
              })
        
            }
          }
        },
      })      
    }
    
    return items;
  }, [item, store]);
  
  const handleContextMenu: React.MouseEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    setShowMenu({ x: event.clientX, y: event.clientY })
  }

  const handleMenuClose = () => {
    setShowMenu(null);
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
          ? <input type="text" value={name} onBlur={handleBlur} onChange={handleChange} autoFocus />
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

export default ProjectItem;
