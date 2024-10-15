import React from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import type { ValueInterface } from '../../Renderer/ShaderBuilder/Types';
import PropertyVector from './PropertyVector';
import PropertyTexture from '../PropertyTexture';
import PropertyString from '../PropertyString';
import PropertyFloat from './PropertyFloat';
import PropertyColor from './PropertyColor';

type PropsType = {
  value: ValueInterface,
  onChange: () => void,
}

const ValueInput: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => {
  const handleVectorChange = (v: number, index?: number) => {
    runInAction(() => {
      if (Array.isArray(value.value)) {
        value.value[index ?? 0] = v;
        onChange();
      }
    })
  }

  const handleColorChange = (v: number[]) => {
    runInAction(() => {
      value.value = v;
      onChange()
    })
  }

  const handleStringChange = (v: string) => {
    runInAction(() => {
      value.value = v;
      onChange();
    })
  }

  const handleTextureChange = (id: number) => {
    runInAction(() => {
      value.value = id;
      onChange()
    })
  }

  const handleNumberChange = (v: number) => {
    runInAction(() => {
      value.value = v;
      onChange();
    })
  }

  switch (value.dataType) {
    case 'string':
      return <PropertyString node={value} onChange={handleStringChange} />

    case 'texture2D':
      return <PropertyTexture node={value} onChange={handleTextureChange} />

    case 'vec2f':
    case 'vec3f':
    case 'vec4f':
      return <PropertyVector value={value.value} onChange={handleVectorChange} />

    case 'color':
      return <PropertyColor value={value.value} onChange={handleColorChange} />

    case 'float':
      return <PropertyFloat node={value} onChange={handleNumberChange} />
  }

  return null;
})

export default ValueInput;
