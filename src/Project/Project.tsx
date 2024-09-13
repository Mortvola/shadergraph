import React from 'react';
import type { ProjectInterface, ProjectItemLike } from './Types/types';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import ProjectFolder from './ProjectFolder';
import ProjectToolbar from './ProjectToolbar';
import styles from './Project.module.scss';

type PropsType = {
  project: ProjectInterface,
}

const Project: React.FC<PropsType> = observer(({
  project,
}) => {
  const store = useStores();

  const handleSelect = async (item: ProjectItemLike) => {
    store.selectItem(item);
  }

  return (
    <div className={styles.layout}>
      <div className={styles.project}>
        {
          project.projectItems
            ? (
              <ProjectFolder
                project={project}
                folder={project.projectItems}
                onSelect={handleSelect}
                level={0}
              >
                <ProjectToolbar />
              </ProjectFolder>    
            )
            : null
        }
      </div>
    </div>
  )
})

export default Project;
