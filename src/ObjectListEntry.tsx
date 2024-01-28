import React from 'react';
import styles from './ObjectList.module.scss';
import SidebarListEntry from './SidebarListEntry';
import { GameObjectRecord } from './State/types';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import Http from './Http/src';

type PropsType = {
  object: GameObjectRecord,
  onSelect: (selection: GameObjectRecord) => void,
  onDelete: (id: number) => void,
  selected: boolean,
}

const ObjectListEntry: React.FC<PropsType> = observer(({
  object,
  onSelect,
  onDelete,
  selected,
}) => {
  const handleDragStart = () => {

  }

  const handleDrag = () => {

  }

  const handleDragEnd = () => {

  }

  const handleClick = () => {
    onSelect(object);
  }

  const saveGameObject = async (object: GameObjectRecord) => {
    const response = await Http.patch(`/game-objects/${object.id}`, object);

    if (response.ok) {

    }
  }

  const [editing, setEditing] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>(object.name);

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.code === 'Enter') {
      setEditing((prev) => {
        if (prev) {
          object.name = name
          saveGameObject(object);
        }

        return !prev
      });
    }
  }

  const handleBlur = () => {
    setEditing(false);
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    runInAction(() => {
      setName(event.target.value)
    })
  }

  return (
    <SidebarListEntry id={object.id} onDelete={onDelete}>
      <div
        className={`${styles.entry} ${selected ? styles.selected : ''}`}
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        draggable
      >
        {
          editing
            ? <input type="text" value={name} onBlur={handleBlur} onChange={handleChange} autoFocus />
            : object.name
        }
      </div>
    </SidebarListEntry>
  )
})

export default ObjectListEntry;
