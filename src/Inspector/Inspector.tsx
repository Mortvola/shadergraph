import React from 'react';
import styles from './Inspector.module.scss'
import Material from './Material';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import Http from '../Http/src';
import type Texture from '../State/Texture';
import SceneObject from './SceneObject';
import type { MaterialItemInterface } from '../State/types';
import type { SceneObjectInterface } from "../Scene/Types/Types";
import { type ProjectItemLike, ProjectItemType } from '../Project/Types/types';
import type TreeNode from '../Scene/Types/TreeNode';

type PropsType = {
  selectedItem: ProjectItemLike | null,
  selectedNode?: TreeNode | null,
}

const Inspector: React.FC<PropsType> = observer(({
  selectedItem,
  selectedNode,
}) => {
  if (selectedItem?.type === 'texture' && selectedItem.item) {
    const selectedTexture = selectedItem.item as Texture;

    const handleFlipYChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
      const checked = event.target.checked;

      if (selectedTexture) {
        await Http.patch(`/api/textures/${selectedTexture.id}`, {
          flipY: checked
        })  
      }

      runInAction(() => {
        if (selectedTexture) {
          selectedTexture.flipY = checked
        }
      })
    }

    return (
      <div className={styles.inspector}>
        <div>{selectedItem.name}</div>
        <label>
          <input type="checkbox" checked={selectedTexture.flipY} onChange={handleFlipYChange} />
          Flip Y
        </label>
      </div>
    )
  }

  const renderView = () => {
    if (selectedNode) {
      return <SceneObject sceneObject={selectedNode.nodeObject} />
    }

    if (selectedItem) {
      switch (selectedItem.type) {
        case ProjectItemType.SceneObject:
          return (
            selectedItem.item
              ? <SceneObject sceneObject={selectedItem.item as SceneObjectInterface} />
              : null
          )

        case ProjectItemType.Material:
          return (
            <Material materialItem={selectedItem.item as MaterialItemInterface} />
          )

        // case 'particle':
        //   const particle: ParticleSystem | null = project.selectedItem.getItem()

        //   if (particle) {
        //     return (
        //       <Particle particleSystem={particle} />
        //     )  
        //   }
      }
    }

    return null;
  }

  return (
    <div className={styles.inspector}>
      <div>
        {
          renderView()
        }
      </div>
    </div>
  )
})

export default Inspector;
