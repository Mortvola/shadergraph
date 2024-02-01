import React from 'react';
import styles from './Inspector.module.scss'
import ModelTree from './ModelTree/ModelTree';
import Material from './Material';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import Http from '../Http/src';
import Texture from '../State/Texture';
import Particle from './Particle';
import ParticleSystem from '../Renderer/ParticleSystem';

const Inspector: React.FC = observer(() => {
  const store = useStores();

  if (store.selectedItem?.type === 'texture' && store.selectedItem.item) {
    const selectedTexture = store.selectedItem.item as Texture;

    const handleFlipYChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
      const checked = event.target.checked;

      if (selectedTexture) {
        await Http.patch(`/textures/${selectedTexture.id}`, {
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
        <div>{store.selectedItem.name}</div>
        <label>
          <input type="checkbox" checked={selectedTexture.flipY} onChange={handleFlipYChange} />
          Flip Y
        </label>
      </div>
    )
  }

  const renderView = () => {
    if (store.selectedItem) {
      switch (store.selectedItem.type) {
        case 'object':
          return (
            <ModelTree />
          )

        case 'material':
          return (
            <Material />
          )

        case 'particle':
          const particle: ParticleSystem | null = store.selectedItem.getItem()

          if (particle) {
            return (
              <Particle particleSystem={particle} />
            )  
          }
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
