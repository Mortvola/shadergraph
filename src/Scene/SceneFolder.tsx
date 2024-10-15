import React from 'react';
import SceneItem from './SceneItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';
import { type NodesResponse, SceneItemType, type SceneInterface } from './Types/Types';
import type TreeNode from './Types/TreeNode';
import { objectManager } from './Types/ObjectManager';
import { ComponentType } from '../Renderer/Types';
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

        (
          async () => {
            const response = await Http.patch<unknown, NodesResponse>(`/api/tree-nodes/${node.id}`, {
              parentNodeId: folder.id,
              parentTreeId: folder.treeId,
            })

            if (response.ok) {
              node.detachSelf();
              folder.addNode(node);
            }
          }
        )()
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

          const response = await Http.post<unknown, NodesResponse>('/api/tree-nodes', {
            parentNodeId: folder.id,
            rootNodeId: item.itemId
          })

          if (response.ok) {
            const body = await response.body()

            const tree = await scene.treeFromDescriptor(body);

            if (tree) {
              folder.addNode(tree);
            }
          }
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
              const node = await objectManager.add(undefined, name, folder)

              if (node) {
                scene.setSelected(node);
              }

              break;
            }

            case SceneItemType.ParticleSystem: {
              const props = new ParticleSystemProps();

              const node = await objectManager.add(
                { type: ComponentType.ParticleSystem, props },
                name,
                folder,
              );

              if (node) {
                scene.setSelected(node);
              }

              break;
            }

            case SceneItemType.Light: {
              const props = new LightProps();

              const node = await objectManager.add(
                { type: ComponentType.Light, props: props },
                name,
                folder,
              );

              if (node) {
                scene.setSelected(node);
              }

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
        key={`${folder.id}:${folder.treeId}`}
        scene={scene}
        treeNode={folder}
        onSelect={onSelect}
        selected={folder === scene.selectedNode}
        draggable
        level={level}
      />
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
            key={`${i.id}:${i.treeId}`}
            scene={scene}
            folder={i}
            onSelect={onSelect}
            level={level + 1}
          />
        ))
      }
    </div>
  )
})

export default SceneFolder;
