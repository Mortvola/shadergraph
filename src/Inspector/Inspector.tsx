import React from 'react';
import styles from './Inspector.module.scss'
import Material from './Material';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import Http from '../Http/src';
import type Texture from '../State/Texture';
import SceneObject from './SceneObject';
import type { MaterialItemInterface } from '../State/types';
import type { SceneObjectInterface } from "../Scene/Types/Types";

const Inspector: React.FC = observer(() => {
  const { project, scene } = useStores();

  if (project.selectedItem?.type === 'texture' && project.selectedItem.item) {
    const selectedTexture = project.selectedItem.item as Texture;

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
        <div>{project.selectedItem.name}</div>
        <label>
          <input type="checkbox" checked={selectedTexture.flipY} onChange={handleFlipYChange} />
          Flip Y
        </label>
      </div>
    )
  }

  const renderView = () => {
    if (scene?.selectedObject) {
      return <SceneObject sceneObject={scene.selectedObject} />
    }

    if (project.selectedItem) {
      switch (project.selectedItem.type) {
        case 'object':
          return (
            project.selectedItem.item
              ? <SceneObject sceneObject={project.selectedItem.item as SceneObjectInterface} />
              : null
          )

        case 'material':
          return (
            <Material materialItem={project.selectedItem.item as MaterialItemInterface} />
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
