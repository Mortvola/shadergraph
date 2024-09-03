import React from 'react';
import type { DecalItem } from '../Renderer/Types';
import styles from './Decal.module.scss';
import NumberInput from './NumberInput';
import { useStores } from '../State/store';

type PropsType = {
  decalItem: DecalItem,
  onChange: (decal: DecalItem) => void,
}

const Decal: React.FC<PropsType> = ({
  decalItem,
  onChange,
}) => {
  const { project } = useStores();

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    decalItem.materialId = parseInt(event.target.value, 10);
    onChange(decalItem)
  }

  const [width, setWidth] = React.useState<number>((decalItem.width ?? 1))
  const [height, setHeight] = React.useState<number>((decalItem.height ?? 1))

  const handleWidthChange = (value: number) => {
    setWidth(value)
    decalItem.width = value
    onChange(decalItem)
  }

  const handleHeightChange = (value: number) => {
    setHeight(value)
    decalItem.height = value
    onChange(decalItem)
  }

  const [materials] = React.useState(project.getAllItemsOfType('material'))

  return (
    <div className={styles.layout}>
      <label>
        Material: 
        {/* <TextureSelector id={decalItem.textureId} onChange={handleChange} /> */}
        <select value={decalItem.materialId} onChange={handleChange}>
          {
            materials.map((m) => (
              <option value={m.itemId ?? -1}>{m.name}</option>
            ))
          }
        </select>
      </label>
      <label>
        Width:
        <NumberInput value={width} onChange={handleWidthChange} />
      </label>
      <label>
        Height:
        <NumberInput value={height} onChange={handleHeightChange} />
      </label>
    </div>
  )
}

export default Decal;
