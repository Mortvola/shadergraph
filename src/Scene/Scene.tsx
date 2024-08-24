import React from 'react';
import SceneToolbar from './SceneToolbar';
import { observer } from 'mobx-react-lite';
import SceneObject from './SceneObject';
import { runInAction } from 'mobx';
import { SceneInterface, SceneObjectInterface } from '../State/types';

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
        {
          scene?.objects.map((o) => (
            <SceneObject key={o.id} object={o} onClick={handleObjectClick} selected={scene.selectedObject === o} />
          )) ?? null
        }
      </div>
    </div>
  )
})

export default Scene;
