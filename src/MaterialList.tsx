import React from 'react';
import Http from './Http/src';
// import { useStores } from './State/store';
import styles from './MaterialList.module.scss';
import SelectShader from './SelectShader';
import { MaterialDescriptor } from './Renderer/Materials/MaterialDescriptor';
import { generateMaterial } from './Renderer/ShaderBuilder/ShaderBuilder';

const MaterialList: React.FC = () => {
  // const store = useStores();

  const [material, setMaterials] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/materials-list');

    if (response.ok) {
      const list = await response.body()

      setMaterials(list);
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const handleAddClick = () => {
  }

  const addMaterial = async (values: unknown) => {
    const response = await Http.post<unknown, number>('/materials', values);

    if (response.ok) {
      const id = await response.body();
    }
  }

  const handleSelection = async (id: number) => {
    const response = await Http.get<{ name: string, descriptor: MaterialDescriptor }>(`/shader-descriptors/${id}`)

    if (response.ok) {
      const descriptor = await response.body();

      const [, properties] = generateMaterial(descriptor.descriptor);

      await addMaterial({
        name: descriptor.name,
        shaderId: id,
        properties,
      })
    }
  }

  return (
    <div className={styles.list}>
      Materials
      <SelectShader onSelection={handleSelection} />
      {
        material.map((m) => (
          <div key={m.id}>{m.name}</div>
        ))
      }              
    </div>
  )
}

export default MaterialList;
