import React from 'react';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import ValueInput from '../ShaderEditor/Properties/ValueInput';
import styles from './Material.module.scss';
import type { MaterialItemInterface } from '../State/types';
import { materialManager } from '../Renderer/Materials/MaterialManager';
import type { ShaderDescriptor } from '../Renderer/shaders/ShaderDescriptor';
import { shaderManager } from '../Renderer/shaders/ShaderManager';
import Value from '../Renderer/ShaderBuilder/Value';
import { runInAction } from 'mobx';

type PropsType = {
  materialItem: MaterialItemInterface | null,
}

const Material: React.FC<PropsType> = observer(({
  materialItem,
}) => {
  const { project } = useStores()

  const handleValueChange = () => {
    if (materialItem) {
      materialManager.applyPropertyValues(materialItem.id, materialItem.properties)
    }
  }

  const [shaders] = React.useState(project.getAllItemsOfType('shader'))

  const [shaderDescr, setShaderDescr] = React.useState<ShaderDescriptor | null>(null)
  const [propValues, setPropValues] = React.useState<{ name: string, value: Value }[]>([])

  React.useEffect(() => {
    (async () => {
      if (materialItem?.shaderId) {
        const descriptor = await shaderManager.getDescriptor(materialItem.shaderId)

        setShaderDescr(descriptor ?? null)
  
        const values = (descriptor?.properties?.map((p) => ({
          name: p.name,
          value: new Value(p.dataType, p.value),
        })) ?? [])
  
        setPropValues(values);  
      }      
    })()
  }, [materialItem?.shaderId])
  
  const handleShaderChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    if (materialItem) {
      runInAction(() => {
        materialItem.setShaderId(parseInt(event.target.value, 10))
      })
    }
  }

  return (
    <>
      <label>
        Shader:
        <select value={materialItem?.shaderId} onChange={handleShaderChange}>
          <option value={-1}>Decal</option>
          {
            shaders.map((s) => (
              <option value={s.itemId ?? -1}>{s.name}</option>
            ))
          }
          <option>test</option>
          <option>test2</option>
        </select>
      </label>
      {
        shaderDescr?.properties
          ? (
            propValues.filter((p) => p.value.dataType !== 'sampler')
            .map((p, index) => {
              let materialProp = materialItem?.properties.find((mp) => mp.name === p.name)

              if (!materialProp) {
                materialProp = {
                  name: p.name,
                  value: p.value.copy(),
                  builtin: false,
                }

                materialItem?.properties.push(materialProp)
              }

              return (
                <div key={p.name} className={styles.property} >
                  <div>{`${p.name}:`}</div>
                  <ValueInput key={`${materialItem?.id}:${index}`} value={materialProp.value} onChange={handleValueChange} />
                </div>
              )
            })
          )
          : null
      }
    </>
  )
})

export default Material;
