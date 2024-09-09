import React from 'react';
import SceneToolbar from './SceneToolbar';
import { observer } from 'mobx-react-lite';
import type { SceneNodeBaseInterface } from "./Types/Types";
import type { SceneInterface } from "./Types/Types";
import SceneFolder from './SceneFolder';
import styles from './Scene.module.scss'

type PropsType = {
  scene?: SceneInterface,
}

const Scene: React.FC<PropsType> = observer(({
  scene,
}) => {
  const handleObjectClick = (object: SceneNodeBaseInterface) => {    
    scene?.setSelectedObject(object)
  }

  if (scene === undefined) {
    return (
      <div>Select a scene to edit.</div>
    )
  }

  return (
    <div className={styles.scene}>
      <div className={styles.sceneTitle}>
        Scene
        <SceneToolbar scene={scene} />
      </div>
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
