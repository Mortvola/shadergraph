import React from 'react';
import styles from './Inspector.module.scss'
import ModelTree from './ModelTree/ModelTree';
import Tab from './Tabs/Tab';
import TabPane from './Tabs/TabPane';
import Material from './Material';
import Tabs from './Tabs/Tabs';
import { useStores } from './State/store';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import Http from './Http/src';

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

  return (
    <div className={styles.inspector}>
      <Tabs>
        <Tab tabKey="Object" onSelect={handleSelect}>Object</Tab>
        <Tab tabKey="Material" onSelect={handleSelect}>Material</Tab>
      </Tabs>
      <div>
        <TabPane tabKey="Object" currentKey={tabKey}>
          <ModelTree />
        </TabPane>
        <TabPane tabKey="Material" currentKey={tabKey}>
          <Material />
        </TabPane>
      </div>
    </div>
  )
})

export default Inspector;
