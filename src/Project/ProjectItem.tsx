import React from 'react';
import { ProjectItemInterface } from './Types/types';
import styles from './ProjectItem.module.scss';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';

type PropsType = {
  item: ProjectItemInterface,
  onSelect: (item: ProjectItemInterface) => void,
  selected: boolean,
  draggable?: boolean,
}

const ProjectItem: React.FC<PropsType> = observer(({
  item,
  onSelect,
  selected,
  draggable = false,
}) => {
  const store = useStores();

  const handleClick = () => {
    onSelect(item)
  }

  const handleDragStart: React.DragEventHandler = (event) => {
    event.dataTransfer.clearData();
    event.dataTransfer.setData("application/project-item", item.id.toString());

    store.draggingItem = item;
  }

  const handleDrag = () => {

  }

  const handleDragEnd = () => {
    store.draggingItem = null;
  }

  const [editing, setEditing] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>(item.name);

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.code === 'Enter') {
      setEditing((prev) => {
        if (prev) {
          item.changeName(name)
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

  return (
    <div
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {
        editing
          ? <input type="text" value={name} onBlur={handleBlur} onChange={handleChange} autoFocus />
          : `${item.name}`
      } 
    </div>
  )
})

export default ProjectItem;
