import React from 'react';
import styles from './Inspector.module.scss'
import ModelTree from './ModelTree/ModelTree';
import Tab from './Tabs/Tab';
import TabPane from './Tabs/TabPane';
import Material from './Material';
import Tabs from './Tabs/Tabs';

const Inspector: React.FC = () => {
  const [tabKey, setTabKey] = React.useState<string>('Object')
  
  const handleSelect = (key: string) => {
    setTabKey(key)
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
}

export default Inspector;
