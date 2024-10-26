import React from 'react';
import { type FolderInterface, type ProjectInterface } from './Types/types';
import { observer } from 'mobx-react-lite';
import { useStores } from '../State/store';

type PropsType = {
  project: ProjectInterface,
  folder: FolderInterface,
}

const NewProjectItem: React.FC<PropsType> = observer(({
  project,
  folder,
}) => {
  const store = useStores();

  const [name, setName] = React.useState<string>('')

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.code === 'Escape') {
      project.cancelNewItem(folder)
    }
    else if (event.code === 'Enter' && folder.newItemType != null && name.length > 0) {
      const newItemType = folder.newItemType;
      (
        async () => {
          const item = await project.createNewItem(name, newItemType, folder)

          if (item) {
            store.selectItem(item)
            store.openItem(item)
          }
        }
      )()
    }

    // setName('');
  }

  const handleBlur = () => {
    project.cancelNewItem(folder);
    setName('');
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value)
  }

  if (folder.newItemType !== null) {
    return (
      <input
        type="text"
        value={name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
      />
    )
  }

  return null;
})

export default NewProjectItem;
