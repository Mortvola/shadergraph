import React from 'react';
import SceneItem from './SceneItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';
import type { SceneNodeBaseInterface } from "./Types/Types";
import type { SceneInterface } from "./Types/Types";
import { isPrefabItem } from '../Project/Types/types';
import PrefabInstance from './Types/PrefabInstance';

type PropsType = {
  project: SceneInterface,
  folder: SceneNodeBaseInterface,
  onSelect?: (item: SceneNodeBaseInterface) => void,
  level: number,
}

const SceneFolder: React.FC<PropsType> = observer(({
  project,
  folder,
  onSelect,
  level,
}) => {
  const store = useStores();

  // React.useEffect(() => {
  //   project.getFolder(folder);
  // }, [folder, store])

  const [droppable, setDroppable] = React.useState<boolean>(false);

  const handleDragOver: React.DragEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if ((
      event.dataTransfer.types[0] === 'application/scene-item'
      && project.draggingItem
      && project.draggingItem.parent !== folder
      && project.draggingItem !== folder
      && !folder.isAncestor(project.draggingItem)
    )) {
      event.dataTransfer.dropEffect = 'move';
      setDroppable(true);      
    } else if ((
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem?.type === 'prefab'  
    )) {
      event.dataTransfer.dropEffect = 'link';
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
      if (project.draggingItem && event.dataTransfer.types[0] === 'application/scene-item') {
        const item = project.draggingItem;

        item.detachSelf();

        folder.addObject(item);    
      }
      else if (
        event.dataTransfer.types[0] === 'application/project-item'
        && store.draggingItem?.type === 'prefab'
      ) {
        (async () => {
          const item = store.draggingItem;

          if (isPrefabItem(item)) {
            const prefab = await item.getItem();
  
            if (prefab) {
              const prefabInstance = await PrefabInstance.fromPrefab(prefab);
    
              if (prefabInstance) {
                await prefabInstance.save();
                
                if (prefabInstance.root) {
                  folder.addObject(prefabInstance.root);
                }
              }
            }
          }
        })()
      }

      setDroppable(false);
    }
  }

  const [name, setName] = React.useState<string>('')

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    // if (event.code === 'Escape') {
    //   project.cancelNewItem(folder)
    //   setName('');
    // }
    // else if (event.code === 'Enter' && name.length > 0) {
    //   project.createNewItem(name, folder.newItem!, folder)
    //   setName('');
    // }
  }

  const handleBlur = () => {
    // project.cancelNewItem(folder);
    // setName('');
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value)
  }

  return (
    <div
      className={droppable ? styles.droppable : undefined}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <SceneItem
        key={folder.id}
        project={project}
        item={folder}
        onSelect={onSelect}
        selected={folder === project.selectedObject}
        draggable
      />
      <div
        style={{ paddingLeft: level > 0 ? 16 : 0 }}
      >
        {/* {
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
        } */}
        {
          folder.nodes.map((i) => (
            <SceneFolder
              key={`children:${i.id}`}
              project={project}
              folder={i}
              onSelect={onSelect}
              level={level + 1}
            />
          ))
        }
      </div>
    </div>
  )
})

export default SceneFolder;
