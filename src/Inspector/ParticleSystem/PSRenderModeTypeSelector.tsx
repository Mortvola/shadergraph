import React from 'react';
import { RenderMode } from '../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: RenderMode,
  onChange?: (value: RenderMode) => void,
}

const PSRenderModeTypeSelector: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    if (onChange) {
      onChange(event.target.value as RenderMode);
    }
  }

  return (
    <select value={value} onChange={handleChange}>
      <option value={RenderMode.Billboard}>Billboard</option>
      <option value={RenderMode.HorizontalBillboard}>Horizontal Billboard</option>
      <option value={RenderMode.StretchedBillboard}>Stretched Billboard</option>
      <option value={RenderMode.Mesh}>Mesh</option>
    </select>
  )
})

export default PSRenderModeTypeSelector;
