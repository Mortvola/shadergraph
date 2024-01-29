import React from 'react';
import Http from '../Http/src';
import SelectShader from './SelectShader';
import { MaterialDescriptor } from '../Renderer/Materials/MaterialDescriptor';
import { generateMaterial } from '../Renderer/ShaderBuilder/ShaderBuilder';
import SidebarList from './SidebarList';
import MaterialListEntry from './MaterialListEntry';
import { useStores } from '../State/store';
import { MaterialInterface } from '../State/types';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

const MaterialList: React.FC = observer(() => {
  const store = useStores();

  React.useEffect(() => {
    store.materials.query();
  }, [store.materials])

  const addMaterial = async (values: unknown) => {
    const response = await Http.post<unknown, number>('/materials', values);

    if (response.ok) {
      const id = await response.body();
    }
  }

  const handleAdd = async (id: number) => {
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

  const [selection, setSelection] = React.useState<MaterialInterface | null>(null);

  const handleSelect = (id: number) => {
    const selection = store.materials.materials.find((m) => m.id === id)

    if (selection) {
      setSelection(selection);

      store.selectMaterial(selection);  
    }
  }

  const handleDelete = async (id: number) => {
    const response = await Http.delete(`/materials/${id}`)

    if (response.ok) {
      runInAction(() => {
        const index = store.materials.materials.findIndex((m) => m.id === id)

        if (index !== -1) {
            store.materials.materials = [
              ...store.materials.materials.slice(0, index),
              ...store.materials.materials.slice(index + 1),
            ]  
        }
      })

      if (selection?.id === id) {
        setSelection(null);
      }
    }
  }

  const renderAddButton = () => (
    <SelectShader onSelection={handleAdd} />
  )

  return (
    <SidebarList title="Materials" addButton={renderAddButton()}>
      {
        store.materials.materials.map((m) => (
          <MaterialListEntry
            key={m.id}
            material={m}
            onSelect={handleSelect}
            onDelete={handleDelete}
            selected={store.selectionType === 'Material' && m.id === store.selectedMaterial?.id}
          />
        ))
      }              
    </SidebarList>
  )
})

export default MaterialList;
