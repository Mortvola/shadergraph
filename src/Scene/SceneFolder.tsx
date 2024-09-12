import React from 'react';
import SceneItem from './SceneItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';
import type { SceneInterface } from "./Types/Types";
import type TreeNode from './Types/TreeNode';

type PropsType = {
  scene: SceneInterface,
  folder: TreeNode,
  onSelect?: (item: TreeNode) => void,
  level: number,
}

const SceneFolder: React.FC<PropsType> = observer(({
  scene,
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
      && scene.draggingNode
      && scene.draggingNode.parent !== folder
      && scene.draggingNode !== folder
      && !folder.isAncestor(scene.draggingNode)
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
      if (scene.draggingNode && event.dataTransfer.types[0] === 'application/scene-item') {
        const node = scene.draggingNode;

        node.detachSelf();

        folder.addNode(node);    
      }
      else if (
        event.dataTransfer.types[0] === 'application/project-item'
        && store.draggingItem?.type === 'prefab'
      ) {
        // (async () => {
        //   const item = store.draggingItem;

        //   if (isPrefabItem(item)) {
        //     const prefab = await item.getItem();
  
        //     if (prefab) {
        //       const prefabInstance = await PrefabInstance.fromPrefab(prefab);
    
        //       if (prefabInstance) {
        //         await prefabInstance.save();
                
        //         if (prefabInstance.root) {
        //           folder.addNode(prefabInstance.root);
        //         }
        //       }
        //     }
        //   }
        // })()
      }

      setDroppable(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [name, setName] = React.useState<string>('')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBlur = () => {
    // project.cancelNewItem(folder);
    // setName('');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        scene={scene}
        item={folder}
        onSelect={onSelect}
        selected={folder === scene.selectedNode}
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
              scene={scene}
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
