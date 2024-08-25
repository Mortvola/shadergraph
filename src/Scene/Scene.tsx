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
      <div>
        <ProjectFolder
          key={'scene'}
          project={scene}
          folder={scene.objects}
          onSelect={handleObjectClick}
          selected={false}
          level={0}
        />  
      </div>
    </div>
  )
})

export default Scene;
