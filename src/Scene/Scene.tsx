import React from 'react';
import SceneToolbar from './SceneToolbar';
import SceneData from './Types/Scene';
import { observer } from 'mobx-react-lite';
import SceneObject from './SceneObject';
import SceneObjectData from '../State/SceneObject';
import { runInAction } from 'mobx';
import { useStores } from '../State/store';

type PropsType = {
  scene?: SceneData,
}

const Scene: React.FC<PropsType> = observer(({
  scene,
}) => {
  const [selected, setSelected] = React.useState<SceneObjectData>();

  const handleObjectClick = (object: SceneObjectData) => {
    setSelected(object);
    
    runInAction(() => {
      if (scene) {
        scene.selectedObject = object;
      }
    })
  }

  return (
    <div>
      Scene
      <SceneToolbar scene={scene} />
      <div>
        {
          scene?.objects.map((o) => (
            <SceneObject key={o.id} object={o} onClick={handleObjectClick} selected={selected === o} />
          )) ?? null
        }
      </div>
    </div>
  )
})

export default Scene;
