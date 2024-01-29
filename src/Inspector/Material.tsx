import React from 'react';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import { ValueType } from '../Renderer/ShaderBuilder/Types';
import ValueInput from '../ShaderEditor/ValueInput';
import styles from './Material.module.scss';

const Material: React.FC = observer(() => {
  const store = useStores();

  const getValue = (value: ValueType): string => {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    return '';
  }

  const handleValueChange = () => {
    if (store.selectedMaterial) {
      store.materials.applyPropertyValues(store.selectedMaterial);
    }
  }

  return (
    <>
      {
        store.selectedMaterial?.properties
          .filter((p) => p.value.dataType !== 'sampler')
          .map((p) => (
            <div key={p.name} className={styles.property} >
              <div>{`${p.name}:`}</div>
              <ValueInput value={p.value} onChange={handleValueChange} />
            </div>
          ))
      }
    </>
  )
})

export default Material;
