import React from 'react';
import { FolderInterface, ProjectItemInterface } from './Types/types';
import ProjectItem from './ProjectItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';
import { runInAction } from 'mobx';

type PropsType = {
  folder: FolderInterface,
  onSelect: (item: ProjectItemInterface) => void,
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
    store.getFolder(folder);
  }, [folder, store])

  const [droppable, setDroppable] = React.useState<boolean>(false);

  const handleDragOver: React.DragEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && store.draggingItem.parent !== folder
      && store.draggingItem.id !== folder.id
      && !folder.isAncestor(store.draggingItem)
    ) {
      event.dataTransfer.dropEffect = 'link';
      setDroppable(true);
    }
  }

  const handleDragLeave = () => {
    setDroppable(false);
  }

  const handleDrop: React.DragEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (droppable) {
      // const materialId = parseInt(data);
      // onMaterialAssignment(node, materialId)

      const item = store.draggingItem;

      (
        async () => {
          if (item && item.parent && !folder.isAncestor(item)) {
            await item.parent.removeItem(item)
            await folder.addItem(item)
          }
        }
      )()
  
      setDroppable(false);
    }
  }

  const [name, setName] = React.useState<string>('')

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.code === 'Escape') {
      store.cancelNewItem(folder)
      setName('');
    }
    else if (event.code === 'Enter' && name.length > 0) {
      store.createNewItem(name, folder.newItem!, folder)
      setName('');
    }
  }

  const handleBlur = () => {
    store.cancelNewItem(folder);
    setName('');
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value)
  }

  return (
    <div
      className={droppable ? styles.droppable : ''}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      { children }
      <div
        style={{ paddingLeft: level > 0 ? 16 : 0 }}
      >
        {
          folder.newItem
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
          folder.items.map((i) => (
            i.type === 'folder'
              ? (
                  <ProjectFolder
                    key={`children:${i.id}`}
                    folder={i as FolderInterface}
                    onSelect={onSelect}
                    selected={i.id === store.selectedItem?.id}
                    level={level + 1}
                  >
                    <ProjectItem
                      key={`${i.type}:${i.id}`}
                      item={i}
                      onSelect={onSelect}
                      selected={i.id === store.selectedItem?.id}
                      draggable
                    />
                  </ProjectFolder>
              )
              : (
                <ProjectItem
                  key={`${i.type}:${i.id}`}
                  item={i}
                  onSelect={onSelect}
                  selected={i.id === store.selectedItem?.id}
                  draggable
                />    
              )
          ))
        }
      </div>
    </div>
  )
})

export default ProjectFolder;
