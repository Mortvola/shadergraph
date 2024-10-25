import React from 'react';
import SceneToolbar from './SceneToolbar';
import { observer } from 'mobx-react-lite';
import type { SceneInterface } from './Types/Types';
import SceneFolder from './SceneFolder';
import styles from './Scene.module.scss'
import type TreeNode from './Types/TreeNode';

type PropsType = {
  scene?: SceneInterface,
  className?: string,
}

const Scene: React.FC<PropsType> = observer(({
  scene,
  className,
}) => {
  const handleObjectClick = (node: TreeNode) => {
    scene?.setSelected(node)
  }

  if (scene === undefined) {
    return (
      <div className={className}>Select a scene to edit.</div>
    )
  }

  return (
    <div className={`${styles.scene} ${className ?? ''}`}>
      <div className={styles.sceneTitle}>
        Scene
        <SceneToolbar scene={scene} />
      </div>
      <SceneFolder
        scene={scene}
        folder={scene.root}
        onSelect={handleObjectClick}
        level={1}
      />
    </div>
  )
})

export default Scene;
