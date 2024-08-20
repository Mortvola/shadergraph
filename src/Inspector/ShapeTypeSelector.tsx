import React from 'react';
import { ShapeType } from '../Renderer/ParticleSystem/Types';

type PropsType = {
  value: ShapeType,
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void,
}

const ShapeTypeSelector: React.FC<PropsType> = ({
  value,
  onChange,
}) => (
  <select value={value} onChange={onChange}>
    <option value={ShapeType.Cone}>Cone</option>
    <option value={ShapeType.Sphere}>Sphere</option>
    <option value={ShapeType.Box}>Box</option>
  </select>
)

export default ShapeTypeSelector;
