import React from 'react';
import { RenderAlignment } from '../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: RenderAlignment,
  onChange?: (value: RenderAlignment) => void,
}

const PSRenderAlignmentSelector: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    if (onChange) {
      onChange(event.target.value as RenderAlignment);
    }
  }

  return (
    <select value={value} onChange={handleChange}>
      <option value={RenderAlignment.View}>View</option>
      <option value={RenderAlignment.Local}>Local</option>
      <option value={RenderAlignment.World}>World</option>
    </select>
  )
})

export default PSRenderAlignmentSelector;
