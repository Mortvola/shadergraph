import React from 'react';
import { PSColorType } from '../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: PSColorType,
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
}

const PSColorTypeSelector: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => (
  <select value={value} onChange={onChange}>
    <option value={PSColorType.Constant}>Constant</option>
    <option value={PSColorType.Random}>Random between two colors</option>
    <option value={PSColorType.Gradient}>Gradient</option>
    <option value={PSColorType.RandomeGradient}>Random between two Gradients</option>
  </select>
))

export default PSColorTypeSelector;
