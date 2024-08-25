import React from 'react';
import ProjectItem from './ProjectItem';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import styles from './Project.module.scss';
import { SceneInterface, SceneObjectInterface } from '../State/types';

type PropsType = {
  project: SceneInterface,
  folder: SceneObjectInterface,
  onSelect?: (item: SceneObjectInterface) => void,
  selected: boolean,
  level: number,
  children?: React.ReactNode,
}

const ProjectFolder: React.FC<PropsType> = observer(({
  project,
  folder,
  onSelect,
  selected,
  level,
  children,
}) => {
  const store = useStores();

  // React.useEffect(() => {
  //   project.getFolder(folder);
  // }, [folder, store])

  const [droppable, setDroppable] = React.useState<boolean>(false);

  const handleDragOver: React.DragEventHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();

    console.log(`Checking drop on ${folder.name}`)

    if (
      event.dataTransfer.types[0] === 'application/scene-item'
      && project.draggingItem
      && project.draggingItem.parent !== folder
      && project.draggingItem !== folder
      && !folder.isAncestor(project.draggingItem)
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

    if (droppable && project.draggingItem) {
      const item = project.draggingItem;

      item.detachSelf();

      folder.addObject(item);
  
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
      className={droppable ? styles.droppable : ''}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      { children }
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
          folder.objects.map((i) => (
            // i.objects.length > 0
            //   ? (
                  <ProjectFolder
                    key={`children:${i.id}`}
                    project={project}
                    folder={i}
                    onSelect={onSelect}
                    selected={i.id === project.selectedObject?.id}
                    level={level + 1}
                  >
                    <ProjectItem
                      key={i.id}
                      project={project}
                      item={i}
                      onSelect={onSelect}
                      selected={i.id === project.selectedObject?.id}
                      draggable
                    />
                  </ProjectFolder>
              // )
              // : (
              //   <ProjectItem
              //     key={i.id}
              //     project={project}
              //     item={i}
              //     onSelect={onSelect}
              //     selected={i.id === project.selectedObject?.id}
              //     draggable
              //   />    
              // )
          ))
        }
      </div>
    </div>
  )
})

export default ProjectFolder;
