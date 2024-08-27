import React from 'react';
import { ProjectItemLike } from './Types/types';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import ProjectFolder from './ProjectFolder';
import ProjectToolbar from './ProjectToolbar';
import styles from './Project.module.scss';

const Project: React.FC = observer(() => {
  const store = useStores();

  const handleSelect = async (item: ProjectItemLike) => {
    store.selectItem(item);
  }

  return (
    <div className={styles.layout}>
      <ProjectToolbar />
      <div className={styles.project}>
        <ProjectFolder
          folder={store.project.projectItems}
          onSelect={handleSelect}
          selected={store.project.projectItems.id === store.project.selectedItem?.id}
          level={0}
        />
      </div>
    </div>
  )
})

export default Project;
