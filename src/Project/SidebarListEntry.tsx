import React from 'react';
import styles from './SidebarList.module.scss';
import { observer } from 'mobx-react-lite';

type PropsType = {
  entity: { id: number, name: string },
  onDelete: (id: number) => void,
  onSelect?: (id: number) => void,
  onChange?: (name: string) => void,
  children: React.ReactNode,
  selected?: boolean,
}

const SidebarListEntry: React.FC<PropsType> = observer(({
  entity,
  onDelete,
  onSelect,
  onChange,
  children,
  selected = false,
}) => {
  const handleDelete = () => {
    onDelete(entity.id)
  }

  const handleClick = () => {
    if (onSelect) {
      onSelect(entity.id)
    }
  }

  const [editing, setEditing] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>(entity.name);

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.code === 'Enter') {
      setEditing((prev) => {
        if (prev && onChange) {
          onChange(name)
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
      className={`${styles.entry} ${selected ? styles.selected : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {
        editing
          ? <input type="text" value={name} onBlur={handleBlur} onChange={handleChange} autoFocus />
          : children
      }
      <button type="button" onClick={handleDelete}>X</button>
    </div>
  )
})

export default SidebarListEntry;
