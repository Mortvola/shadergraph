import React from 'react';
import SceneToolbar from './SceneToolbar';
import { observer } from 'mobx-react-lite';
import { SceneInterface, SceneObjectInterface } from '../State/types';
import SceneFolder from './SceneFolder';

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
      <SceneToolbar scene={scene} />
      <SceneFolder
        key={'scene'}
        project={scene}
        folder={scene.rootObject}
        onSelect={handleObjectClick}
        level={1}
      />
    </div>
  )
})

export default Scene;
