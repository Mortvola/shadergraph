import React from 'react';
import ColorPicker from './ColorPicker';
import { LightItem } from '../Renderer/types';
import NumberInput from './NumberInput';

type PropsType = {
  light: LightItem,
  onChange: (light: LightItem) => void,
}

const LightComponent: React.FC<PropsType> = ({
  light,
  onChange,
}) => {
  const handleColorChange = () => {
    onChange(light)
  }

  const handleConstantChange = (value: number) => {
    light.constant = value;
    onChange(light)
  }

  const handleLinearChange = (value: number) => {
    light.linear = value;
    onChange(light)
  }

  const handleQuadraticChange = (value: number) => {
    light.quadratic = value;
    onChange(light)
  }

  return (
    <div>
      <label>
        Color:
        <div>
          <ColorPicker value={light.color} onChange={handleColorChange} />
        </div>
      </label>
      Parameters:
      <div>
        <label>
          Constant:
          <NumberInput value={light.constant} onChange={handleConstantChange} />
        </label>
        <label>
          Linear:
          <NumberInput value={light.linear} onChange={handleLinearChange} />
        </label>
        <label>
          Quadratic:
          <NumberInput value={light.quadratic} onChange={handleQuadraticChange} />
        </label>
      </div>
    </div>
  )
}

export default LightComponent;
