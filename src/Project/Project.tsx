import React from 'react';
import { ProjectItemInterface } from './Types/types';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import ProjectFolder from './ProjectFolder';

const Project: React.FC = observer(() => {
  const store = useStores();

  const handleSelect = async (item: ProjectItemInterface) => {
    store.selectItem(item);
  }

  return (
    <>
      <ProjectFolder
        folder={store.projectItems}
        onSelect={handleSelect}
        selected={store.projectItems.id === store.selectedItem?.id}
        level={0}
      />
    </>
  )
})

export default Project;
