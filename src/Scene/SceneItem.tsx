import React from 'react';
import styles from './SceneItem.module.scss';
import { observer } from 'mobx-react-lite';
import ContextMenu from '../ContextMenu/ContextMenu';
import type { MenuItemLike } from '../ContextMenu/types';
import type { SceneObjectBaseInterface } from "./Types/Types";
import type { SceneInterface } from "./Types/Types";
import { isPrefabInstanceObject } from './Types/PrefabInstanceObject';

type PropsType = {
  project: SceneInterface,
  item: SceneObjectBaseInterface,
  onSelect?: (item: SceneObjectBaseInterface) => void,
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
  // const store = useStores();

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
      { name: 'Delete', action: () => { item.delete() } },
    ];
    
    return items;
  }, [item]);
  
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
      className={`${styles.item} ${selected ? styles.selected : ''} ${isPrefabInstanceObject(item) ? styles.prefab : ''}`}
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
