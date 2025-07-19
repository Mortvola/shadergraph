import React from 'react';
import SceneToolbar from './SceneToolbar';
import { observer } from 'mobx-react-lite';
import type { SceneInterface } from './Types/Types';
import SceneFolder from './SceneFolder';
import styles from './Scene.module.scss'
import type SceneNode from './Types/SceneNode';
import { ChevronLeft } from 'lucide-react';

type PropsType = {
  scene?: SceneInterface,
  className?: string,
}

const Scene: React.FC<PropsType> = observer(({
  scene,
  className,
}) => {
  const handleObjectClick = (node: SceneNode) => {
    scene?.setSelected(node)
  }

  const handleBackClick = () => {
    if (scene) {
      (
        async () => {
          await scene.popTree()
          scene.renderScene()
        }
      )()
    }
  }

  if (scene === undefined) {
    return (
      <div className={`${styles.noScene} ${className ?? ''}`}>Select a scene to edit.</div>
    )
  }

  return (
    <div className={`${styles.scene} ${className ?? ''}`}>
      <div>
        <div className={styles.sceneTitle}>
          Scene
          <SceneToolbar scene={scene} />
        </div>
        {
          scene.rootStack.length > 1
            ? <ChevronLeft size={16} onClick={handleBackClick} />
            : null
        }
      </div>
      <div className={styles.tree}>
        {
          scene.root
            ? (
              <SceneFolder
              scene={scene}
              folder={scene.root}
              onSelect={handleObjectClick}
              level={1}
            />
            )
            : null
        }
      </div>
    </div>
  )
})

export default Scene;
