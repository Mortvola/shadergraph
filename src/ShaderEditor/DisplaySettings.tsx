import React from 'react';
import type Display from '../Renderer/ShaderBuilder/Nodes/Display';
import { observer } from 'mobx-react-lite';
import { BlendMode } from '../Renderer/ShaderBuilder/Types';
import styles from './DisplaySettings.module.scss';
import { runInAction } from 'mobx';
import { type CullMode } from '../Renderer/ShaderBuilder/Types';
import Checkbox from './Controls/Checkbox';

type PropsType = {
  node: Display,
  style?: React.CSSProperties,
}

const DisplaySettings: React.FC<PropsType> = observer(({
  node,
  style,
}) => {
  const handleBlendModeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    runInAction(() => {
      node.settings.blendMode = event.target.value as BlendMode;
    })
  }

  const handlePointerDown: React.MouseEventHandler = (event) => {
    event.stopPropagation()
  }

  const handleClick: React.MouseEventHandler = (event) => {
    event.stopPropagation()
  }

  const handleTransparencyChange = (value: boolean) => {
    runInAction(() => {
      node.settings.transparent = value;
    })
  }

  const handleCullChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    runInAction(() => {
      node.settings.cullMode = event.target.value as CullMode
    })
  }

  const handleDepthWriteChange = (value: boolean) => {
    runInAction(() => {
      node.settings.depthWriteEnabled = value;
    })
  }

  const handleLitChange = (value: boolean) => {
    runInAction(() => {
      node.settings.lit = value;
    })
  }

  return (
    <div className={styles.settings} style={style} onPointerDown={handlePointerDown} onClick={handleClick}>
      <Checkbox value={node.settings.lit} label="Lit" onChange={handleLitChange} />
      <Checkbox value={node.settings.transparent} label="Transparent" onChange={handleTransparencyChange} />
      <label>
        Blend Mode:
        <select value={node.settings.blendMode} onChange={handleBlendModeChange}>
          <option value={BlendMode.Alpha}>Alpha</option>
          <option value={BlendMode.Addititve}>Addititve</option>
        </select>
      </label>
      <label>
        Cull Mode
        <select value={node.settings.cullMode} onChange={handleCullChange}>
          <option value="none">None</option>
          <option value="back">Back</option>
          <option value="front">Front</option>
        </select>
      </label>
      <Checkbox value={node.settings.depthWriteEnabled} label="Depth Write Enabled" onChange={handleDepthWriteChange} />
    </div>
  )
})

export default DisplaySettings;
