import React from 'react';
import { FolderInterface, ProjectItemLike, ProjectItemType } from './Types/types';
import ProjectItem from './ProjectItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';

type PropsType = {
  folder: FolderInterface,
  onSelect: (item: ProjectItemLike) => void,
  selected: boolean,
  level: number,
  children?: React.ReactNode,
}

const ProjectFolder: React.FC<PropsType> = observer(({
  folder,
  onSelect,
  selected,
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

        if (sceneObject) {
          ( async () => {
            const prefab = sceneObject.createPrefab();

            if (prefab) {
              const descriptor = prefab.toDescriptor();

              const item = await store.project.createNewItem(prefab.name, ProjectItemType.Prefab, folder, {
                parentId: folder.id,
                name: prefab.name,
                prefab: descriptor,
              })

              if (item) {
                item.item = prefab;
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
              selected={i.id === store.project.selectedItem?.id}
              level={level + 1}
            >
              <div className={styles.item}>
                <div
                  className={`${styles.collapser} ${(i as FolderInterface).open ? styles.open : ''}`}
                  onClick={() => { (i as FolderInterface).toggleOpen()}}
                />
                <ProjectItem
                  key={`${i.type}:${i.id}`}
                  item={i}
                  onSelect={onSelect}
                  selected={i.id === store.project.selectedItem?.id}
                  draggable
                />
              </div>
            </ProjectFolder>
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
      className={droppable ? styles.droppable : undefined}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      { children }
      <div
        style={{ paddingLeft: level > 0 ? 12 : 0 }}
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
