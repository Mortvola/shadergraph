import React from 'react';
import styles from './Inspector.module.scss'
import ModelTree from './ModelTree/ModelTree';
import Tab from '../Tabs/Tab';
import TabPane from '../Tabs/TabPane';
import Material from './Material';
import Tabs from '../Tabs/Tabs';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import Http from '../Http/src';

const Inspector: React.FC = observer(() => {
  const store = useStores();

  const [tabKey, setTabKey] = React.useState<string>('Object')
  
  const handleSelect = (key: string) => {
    setTabKey(key)
  }

  if (store.selectionType === 'Texture') {
    if (store.selectedTexture === null) {
      return null;
    }

    const handleFlipYChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
      const checked = event.target.checked;

      if (store.selectedTexture) {
        await Http.patch(`/textures/${store.selectedTexture.id}`, {
          flipY: checked
        })  
      }

      runInAction(() => {
        if (store.selectedTexture) {
          store.selectedTexture.flipY = checked
        }
      })
    }

    return (
      <div className={styles.inspector}>
        <div>{store.selectedTexture?.name}</div>
        <label>
          <input type="checkbox" checked={store.selectedTexture.flipY} onChange={handleFlipYChange} />
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
