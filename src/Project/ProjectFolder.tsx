import React from 'react';
import type { FolderInterface, ProjectItemLike} from './Types/types';
import { ProjectItemType } from './Types/types';
import ProjectItem from './ProjectItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';
import Prefab from '../Scene/Types/Prefab';
import { isSceneObject } from "../Scene/Types/Types";

type PropsType = {
  folder: FolderInterface,
  onSelect: (item: ProjectItemLike) => void,
  level: number,
  children?: React.ReactNode,
}

const ProjectFolder: React.FC<PropsType> = observer(({
  folder,
  onSelect,
  level,
  children,
}) => {
  const store = useStores();

  React.useEffect(() => {
    store.project.getFolder(folder);
  }, [folder, store])

  const [droppable, setDroppable] = React.useState<boolean>(false);

  const handleDragOver: React.DragEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if ((
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && store.draggingItem.parent !== folder
      && store.draggingItem.id !== folder.id
      && !folder.isAncestor(store.draggingItem)
    )) {
      event.dataTransfer.dropEffect = 'move';
      setDroppable(true);
    } else if ((
      event.dataTransfer.types[0] === 'application/scene-item'
      && store.scene?.draggingItem
    )) {
      event.dataTransfer.dropEffect = 'copy';
      setDroppable(true);
    }
    else {
      event.dataTransfer.dropEffect = 'none';
    }
  }

  const handleDragLeave = () => {
    setDroppable(false);
  }

  const handleDrop: React.DragEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (droppable) {
      if (event.dataTransfer.types[0] === 'application/project-item') {
        const item = store.draggingItem;

        (
          async () => {
            if (item && item.parent && !folder.isAncestor(item)) {
              await item.parent.removeItem(item)
              await folder.addItem(item)
            }
          }
        )()
      }
      else if (event.dataTransfer.types[0] === 'application/scene-item') {
        console.log(event.dataTransfer.types[0])
        const sceneObject = store.scene?.draggingItem

        if (isSceneObject(sceneObject)) {
          ( async () => {
            const prefab = Prefab.fromSceneObject(sceneObject);

            if (prefab) {
              const { id, ...descriptor } = prefab.toDescriptor();

              const item = await store.project.createNewItem(prefab.name, ProjectItemType.Prefab, folder, {
                parentId: folder.id,
                ...descriptor,
              })

              if (item) {
                if (item.itemId === null) {
                  throw new Error('itemId is null')
                }
                
                prefab.id = item.itemId;
                item.item = prefab;
                store.selectItem(item);
              }
            }
          })()
        }
      }
    
      setDroppable(false);
    }
  }

  const [name, setName] = React.useState<string>('')

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.code === 'Escape') {
      store.project.cancelNewItem(folder)
    }
    else if (event.code === 'Enter' && name.length > 0) {
      store.project.createNewItem(name, folder.newItemType!, folder)
    }

    setName('');
  }

  const handleBlur = () => {
    store.project.cancelNewItem(folder);
    setName('');
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value)
  }

  const renderFolderItems = () => (
    folder.items.map((i) => (
      i.type === 'folder'
        ? (
            <ProjectFolder
              key={`children:${i.id}`}
              folder={i as FolderInterface}
              onSelect={onSelect}
              level={level + 1}
            />
        )
        : (
          <ProjectItem
            key={`${i.type}:${i.id}`}
            item={i}
            onSelect={onSelect}
            selected={i.id === store.project.selectedItem?.id}
            draggable
          />    
        )
    ))
  )

  return (
    <div
      className={`${styles.folder} ${droppable ? styles.droppable : undefined}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={styles.item} style={{ top: level * 21, zIndex: 100 - level }}>
        <div
          className={`${styles.collapser} ${(folder as FolderInterface).open ? styles.open : ''}`}
          onClick={() => { (folder as FolderInterface).toggleOpen()}}
        />
        <div className={styles.itemWrapper}>
          <ProjectItem
            key={`${folder.type}:${folder.id}`}
            item={folder}
            onSelect={onSelect}
            selected={folder.id === store.project.selectedItem?.id}
            draggable
          />
          {
            children
          }
        </div>
      </div>

      <div
        style={{ paddingLeft: 12 }}
      >
        {
          folder.newItemType
            ? (
              <input
                type="text"
                value={name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                autoFocus
              />
            )
            : null
        }
        {
          folder.open
            ? renderFolderItems()
            : null
        }
      </div>
    </div>
  )
})

export default ProjectFolder;
