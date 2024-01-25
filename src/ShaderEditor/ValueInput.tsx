import React from 'react';
import PropertyVector from './PropertyVector';
import PropertyTexture from './PropertyTexture';
import PropertyString from './PropertyString';
import PropertyFloat from './PropertyFloat';
import { runInAction } from 'mobx';
import { ValueInterface } from '../Renderer/ShaderBuilder/Types';
import { observer } from 'mobx-react-lite';

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

  const handleStringChange = (v: string) => {
    runInAction(() => {
      value.value = v;
      onChange();  
    })
  }

  const handleTextureChange = (id: number) => {
    runInAction(() => {
      value.value = id;
    })
  }

  const handleNumberChange = (v: number) => {
    runInAction(() => {
      value.value = v;
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
      return <PropertyVector node={value} onChange={handleVectorChange} />

      case 'float':
      return <PropertyFloat node={value} onChange={handleNumberChange} />
  }

  return null;
})

export default ValueInput;
