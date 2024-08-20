import React from 'react';
import { observer } from 'mobx-react-lite';
import Renderer from '../../Renderer/ParticleSystem/Renderer';
import PSRenderModeTypeSelector from './PSRenderModeTypeSelector';
import { RenderMode } from '../../Renderer/ParticleSystem/Types';

type PropsType = {
  value: Renderer,
}

const PSRenderer: React.FC<PropsType> = observer(({
  value,
}) => {
  const handleModeChange = (mode: RenderMode) => {
    value.setRenderMode(mode);
  }

  return (
    <label>
      Render Mode:
      <PSRenderModeTypeSelector value={value.mode} onChange={handleModeChange} />
    </label>
  )
})

export default PSRenderer;
