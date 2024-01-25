import React from 'react';
import Http from './Http/src';
import SelectShader from './SelectShader';
import { MaterialDescriptor } from './Renderer/Materials/MaterialDescriptor';
import { generateMaterial } from './Renderer/ShaderBuilder/ShaderBuilder';
import SidebarList from './SidebarList';
import MaterialListEntry from './MaterialListEntry';
import { useStores } from './State/store';
import { MaterialRecord } from './State/types';

const MaterialList: React.FC = () => {
  const store = useStores();
  const [material, setMaterials] = React.useState<MaterialRecord[]>([])

  React.useEffect(() => {
    (async () => {
      const list = await store.materials.getList();
      setMaterials(list);  
    })()
  }, [store.materials])

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

  const [selection, setSelection] = React.useState<MaterialRecord | null>(null);

  const handleSelect = (selection: MaterialRecord) => {
    setSelection(selection);

    store.selectMaterial(selection.id);
  }

  const renderAddButton = () => (
    <SelectShader onSelection={handleSelection} />
  )

  return (
    <SidebarList title="Materials" addButton={renderAddButton()}>
      {
        material.map((m) => (
          <MaterialListEntry material={m} onSelect={handleSelect} selected={m.id === selection?.id} />
        ))
      }              
    </SidebarList>
  )
}

export default MaterialList;
