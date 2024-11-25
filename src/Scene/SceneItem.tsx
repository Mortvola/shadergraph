import React from 'react';
import styles from './SceneItem.module.scss';
import { observer } from 'mobx-react-lite';
import ContextMenu from '../ContextMenu/ContextMenu';
import type { MenuItemLike } from '../ContextMenu/types';
import type { SceneInterface } from './Types/Types';
import type TreeNode from './Types/TreeNode';
import { BoxIcon, ChevronRight, PlusIcon } from 'lucide-react';

type PropsType = {
  scene: SceneInterface,
  treeNode: TreeNode,
  onSelect?: (item: TreeNode) => void,
  selected: boolean,
  draggable?: boolean,
  level: number,
}

const SceneItem: React.FC<PropsType> = observer(({
  scene,
  treeNode,
  onSelect,
  selected,
  draggable = false,
  level,
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(treeNode)
    }
  }

  const handleDragStart: React.DragEventHandler = (event) => {
    event.dataTransfer.clearData();
    event.dataTransfer.setData('application/scene-item', treeNode.id.toString());

    scene.draggingNode = treeNode;
  }

  const handleDrag = () => {

  }

  const handleDragEnd = () => {
    scene.draggingNode = null;
  }

  const [editing, setEditing] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>(treeNode.sceneObject.name.get() ?? 'Unknown');

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.code === 'Enter') {
      setEditing((prev) => {
        if (prev) {
          treeNode.changeName(name)
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
      { name: 'Delete', action: () => { treeNode.delete(); scene.setSelected(null) } },
    ];

    return items;
  }, [treeNode]);

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
    return (
      <div>
        {
          // If the node's parent has a tree ID and the node's tree id does not match the
          // parent's then this must be an outside connection. Include a plus icon with the box icon.
          treeNode.isAddedNode && treeNode.isTopLevel
            ? <PlusIcon size="10" fill="#FFF" strokeWidth={4} />
            : null
        }
        {
          // If the node has a tree id and parent's tree id does not match the node's tree id then
          // this must be a new tree. Fill the icon with blue.
        }
        <BoxIcon fill={treeNode.isModifierRoot ? '#07F' : '#FFF'} size="14" />
      </div>
    )
  }

  const handleOpenClick = () => {
    (
      async () => {
        await scene.pushTree(treeNode.id, treeNode.sceneId)
        scene.renderScene()
      }
    )()
  }

  let className = `${styles.item} ${selected ? styles.selected : ''}`;
  if (!treeNode.isTopLevel || treeNode.isModifierRoot) {
    className = `${className} ${styles.prefab}`
  }

  return (
    <div
      className={className}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onContextMenu={handleContextMenu}
    >
      <div
        style={{
          backgroundColor: treeNode.isTopLevel && treeNode.hasOverrides ? 'blue' : undefined,
        }}
      />
      <div style={{ paddingLeft: (level - 1) * 16 }}>
        {
          renderIcon()
        }
        {
          editing
            ? (
              <input
                type="text"
                value={name}
                onBlur={handleBlur}
                onChange={handleChange}
                autoFocus
                onFocus={handleFocus}
              />
            )
            : `${treeNode.sceneObject.name.get()}`
        }
        {
          showMenu
            ? <ContextMenu menuItems={menuItems} x={showMenu.x} y={showMenu.y} onClose={handleMenuClose} />
            : null
        }
      </div>
      {
        treeNode.isModifierRoot
          ? <ChevronRight size={16} onClick={handleOpenClick} />
          : null
      }
    </div>
  )
})

export default SceneItem;
