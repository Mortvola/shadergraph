import React from 'react';
import type Display from '../Renderer/ShaderBuilder/Nodes/Display';
import { observer } from 'mobx-react-lite';
import { BlendMode } from '../Renderer/ShaderBuilder/Nodes/Display';
import styles from './DisplaySettings.module.scss';
import { runInAction } from 'mobx';

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

  return (
    <div className={styles.settings} style={style} onPointerDown={handlePointerDown} onClick={handleClick}>
      <label>
        Blend Mode:
        <select value={node.settings.blendMode} onChange={handleBlendModeChange}>
          <option value={BlendMode.Alpha}>Alpha</option>
          <option value={BlendMode.Addititve}>Addititve</option>
        </select>
      </label>
    </div>
  )
})

export default DisplaySettings;
