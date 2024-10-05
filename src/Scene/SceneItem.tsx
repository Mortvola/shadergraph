import React from 'react';
import styles from './SceneItem.module.scss';
import { observer } from 'mobx-react-lite';
import ContextMenu from '../ContextMenu/ContextMenu';
import type { MenuItemLike } from '../ContextMenu/types';
import type { SceneInterface } from "./Types/Types";
import type TreeNode from './Types/TreeNode';
import { Box, Plus } from 'lucide-react';

type PropsType = {
  scene: SceneInterface,
  item: TreeNode,
  onSelect?: (item: TreeNode) => void,
  selected: boolean,
  draggable?: boolean,
}

const SceneItem: React.FC<PropsType> = observer(({
  scene,
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

    scene.draggingNode = item;
  }

  const handleDrag = () => {

  }

  const handleDragEnd = () => {
    scene.draggingNode = null;
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
      { name: 'Delete', action: () => { item.delete(); scene.setSelectedObject(null) } },
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

  const renderIcon = () => {
    if (item.parent?.treeId !== undefined && item.treeId !== item.parent.treeId) {
      return (
        <div>
          <Plus size="10" fill="#FFF" strokeWidth={4} />
          <Box fill="#FFF" size="14" />
        </div>
      )
    }

    return (
      <Box fill={item.treeId === undefined || item.treeId === item.parent?.treeId ? '#FFF' : '#07F'} size="14" />
    )
  }

  return (
    <div
      className={`${styles.item} ${selected ? styles.selected : ''} ${(item.treeId !== undefined) ? styles.prefab : ''}`}
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
        renderIcon()
      }
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
