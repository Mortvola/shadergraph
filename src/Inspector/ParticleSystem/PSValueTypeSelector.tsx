import React from 'react';
import { PSValueType } from '../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: PSValueType
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
}

const PSValueTypeSelector: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => (
  <select value={value} onChange={onChange}>
    <option value={PSValueType.Constant}>Constant</option>
    <option value={PSValueType.Random}>Random between two constants</option>
    <option value={PSValueType.Curve}>Curve</option>
    <option value={PSValueType.RandomeCurve}>Random between two Curves</option>
  </select>
))

export default PSValueTypeSelector;
