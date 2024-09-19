import React from 'react';
import SceneItem from './SceneItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';
import { SceneItemType, type SceneInterface } from "./Types/Types";
import TreeNode from './Types/TreeNode';
import SceneObject from './Types/SceneObject';
import { objectManager } from './Types/ObjectManager';
import { ComponentType, type NewSceneObjectComponent } from '../Renderer/Types';
import ParticleSystemProps from '../Renderer/ParticleSystem/ParticleSystemProps';
import LightProps from '../Renderer/Properties/LightProps';
import { ProjectItemType } from '../Project/Types/types';
import Http from '../Http/src';

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
      && store.draggingItem?.type === ProjectItemType.TreeNode
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
        && store.draggingItem?.type === ProjectItemType.TreeNode
      ) {
        const item = store.draggingItem;

        (async () => {
          console.log((item.itemId))

          if (item.itemId === null) {
            throw new Error('itemId is null')
          }

          // const treeNode = await objectManager.getTreeNode(item.itemId!)
          const response = await Http.post('/api/tree-nodes', {
            parentNodeId: folder.id,
            rootNodeId: item.itemId
          })

          if (response.ok) {
            const body = await response.body()


          }
          // console.log(treeNode.id)
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
        })()
      }

      setDroppable(false);
    }
  }

  const [name, setName] = React.useState<string>('')

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.code === 'Escape') {
      folder.cancelNewItem()
      setName('');
    }
    else if (event.code === 'Enter' && name.length > 0) {
      (
        async () => {
          switch (folder.newItemType) {
            case SceneItemType.SceneObject: {
              const object = new SceneObject(undefined, name)
  
              const node = await objectManager.add(object, folder)
  
              if (node) {
                scene.setSelectedObject(node);
              }
    
              break;
            }

            case SceneItemType.ParticleSystem: {
              const object = new SceneObject(undefined, name);
              object.autosave = false;

              const props = new ParticleSystemProps();

              object.addComponent({
                type: ComponentType.ParticleSystem,
                props: props,
              });

              const node = await objectManager.add(object, folder);

              object.autosave = true;
              
              if (node) {
                scene.setSelectedObject(node);
              }

              break;
            }

            case SceneItemType.Light: {
              const object = new SceneObject()

              const props = new LightProps();
      
              const item: NewSceneObjectComponent = {
                type: ComponentType.Light,
                props: props,
              }
      
              object.addComponent(item);
      
              await object.save();
      
              const node = new TreeNode();
      
              node.nodeObject = object;
      
              await objectManager.add(node);
      
              scene.addNode(node);
      
              scene.setSelectedObject(node);
      
              break;
            }
          }

          folder.cancelNewItem()
          setName('');    
        }
      )()
    }
  }

  const handleBlur = () => {
    folder.cancelNewItem();
    setName('');
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
        scene={scene}
        item={folder}
        onSelect={onSelect}
        selected={folder === scene.selectedNode}
        draggable
      />
      <div
        style={{ paddingLeft: level > 0 ? 16 : 0 }}
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
