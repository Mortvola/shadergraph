import React from 'react';
import SceneToolbar from './SceneToolbar';
import { observer } from 'mobx-react-lite';
import { SceneInterface, SceneObjectInterface } from '../State/types';
import ProjectFolder from './ProjectFolder';

type PropsType = {
  scene?: SceneInterface,
}

const Scene: React.FC<PropsType> = observer(({
  scene,
}) => {
  const handleObjectClick = (object: SceneObjectInterface) => {    
    scene?.setSelectedObject(object)
  }

  if (scene === undefined) {
    return (
      <div>Select a scene to edit.</div>
    )
  }

  return (
    <div>
      Scene
      <div>{scene.name}</div>
      <SceneToolbar scene={scene} />
      <ProjectFolder
        key={'scene'}
        project={scene}
        folder={scene.rootObject}
        onSelect={handleObjectClick}
        level={1}
      >
        {scene.name}
      </ProjectFolder>  
    </div>
  )
})

export default Scene;
