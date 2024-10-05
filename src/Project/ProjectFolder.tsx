import React from 'react';
import type { FolderInterface, ProjectInterface, ProjectItemLike} from './Types/types';
import ProjectItem from './ProjectItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';
import { isTreeNode, type ItemResponse } from "../Scene/Types/Types";
import Http from '../Http/src';
import ProjectItemData from './Types/ProjectItem';
import type TreeNode from '../Scene/Types/TreeNode';
import NewProjectItem from './NewProjectItem';

type PropsType = {
  project: ProjectInterface,
  folder: FolderInterface,
  onSelect: (item: ProjectItemLike) => void,
  onOpen?: (item: ProjectItemLike) => void,
  level: number,
  children?: React.ReactNode,
}

const ProjectFolder: React.FC<PropsType> = observer(({
  project,
  folder,
  onSelect,
  onOpen,
  level,
  children,
}) => {
  const store = useStores();

  React.useEffect(() => {
    project.getFolder(folder);
  }, [project, folder])

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
      && store.scene?.draggingNode
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
        if (isTreeNode(store.scene?.draggingNode)) {
          const sceneNode = store.scene?.draggingNode;

          ( async () => {
              const response = await Http.post<unknown, ItemResponse>('/api/tree-nodes/tree', {
                folderId: folder.id,
                nodeId: sceneNode.treeId ?? sceneNode.id,
              })

              if (response.ok) {
                const body = await response.body();

                const projectItem = new ProjectItemData<TreeNode>(body.item.id, body.item.name, body.item.type, folder, sceneNode.id);
                projectItem.item = sceneNode;

                folder.addItem(projectItem)

                if (body.root && body.objects) {
                  const root = await sceneNode.scene.treeFromDescriptor({ root: body.root, objects: body.objects });

                  if (root) {
                    sceneNode.parent?.addNode(root);
                    sceneNode.detachSelf();
                  }
                }
              }
          })()
        }
      }
    
      setDroppable(false);
    }
  }

  const renderFolderItems = () => (
    folder.items.map((i) => (
      i.type === 'folder'
        ? (
            <ProjectFolder
              project={project}
              key={`children:${i.id}`}
              folder={i as FolderInterface}
              onSelect={onSelect}
              onOpen={onOpen}
              level={level + 1}
            />
        )
        : (
          <ProjectItem
            key={`${i.type}:${i.id}`}
            item={i}
            onSelect={onSelect}
            onOpen={onOpen}
            selected={i.id === project.selectedItem?.id}
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
      {/*
          The value multiplied by level is the height of the item. This value and
          the corresponding value in css must be kept in sync
      */}
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
            onOpen={onOpen}
            selected={folder.id === project.selectedItem?.id}
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
        <NewProjectItem project={project} folder={folder} />
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
