import React from 'react';
import styles from './SampleTextureSettings.module.scss';
import type SampleTexture from '../Renderer/ShaderBuilder/Nodes/SampleTexture';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

type PropsType = {
  node: SampleTexture,
  style: React.CSSProperties,
}

const SampleTextureSettings: React.FC<PropsType> = observer(({
  node,
  style,
}) => {
  const handleUAddressModeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    runInAction(() => {
      node.settings.addressModeU = event.target.value
    })
  }

  const handleVAddressModeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    runInAction(() => {
      node.settings.addressModeV = event.target.value      
    })
  }

  const handleMinFilterChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    runInAction(() => {
      node.settings.minFilter = event.target.value      
    })
  }

  const handleMagFilterChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    runInAction(() => {
      node.settings.magFilter = event.target.value      
    })
  }

  const handleMipmapFilterChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    runInAction(() => {
      node.settings.mipmapFilter = event.target.value      
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
        U Address Mode:
        <select value={node.settings.addressModeU} onChange={handleUAddressModeChange}>
          <option value="clamp-to-edge">clamp to edge</option>
          <option value="repeat">repeat</option>
          <option value="mirror-repeat">mirror repeat</option>
        </select>
      </label>

      <label>
        V Address Mode:
        <select value={node.settings.addressModeV} onChange={handleVAddressModeChange}>
          <option value="clamp-to-edge">clamp to edge</option>
          <option value="repeat">repeat</option>
          <option value="mirror-repeat">mirror repeat</option>
        </select>
      </label>

      <label>
        Min Filter:
        <select value={node.settings.minFilter} onChange={handleMinFilterChange}>
          <option value="nearest">nearest</option>
          <option value="linear">linear</option>
        </select>
      </label>

      <label>
        Mag Filter:
        <select value={node.settings.magFilter} onChange={handleMagFilterChange}>
          <option value="nearest">nearest</option>
          <option value="linear">linear</option>
        </select>
      </label>

      <label>
        Mipmap Filter:
        <select value={node.settings.mipmapFilter} onChange={handleMipmapFilterChange}>
          <option value="nearest">nearest</option>
          <option value="linear">linear</option>
        </select>
      </label>
    </div>
  )
})

export default SampleTextureSettings;
