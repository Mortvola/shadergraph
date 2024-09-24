import React from 'react';
import { SpaceType } from '../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: SpaceType,
  onChange?: (value: SpaceType) => void,
}

const PSSpaceTypeSelector: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    if (onChange) {
      onChange(event.target.value as SpaceType);
    }
  }

  return (
    <select value={value} onChange={handleChange}>
      <option value={SpaceType.Local}>Local</option>
      <option value={SpaceType.World}>World</option>
    </select>
  )
})

export default PSSpaceTypeSelector;
