import React from 'react';
import NumberInput from '../../NumberInput';
import ConeData from '../../../Renderer/ParticleSystem/Shapes/Cone';
import { observer } from 'mobx-react-lite';

type PropsType = {
  cone: ConeData
}

const Cone: React.FC<PropsType> = observer(({
  cone,
}) => {
  const handleAngleChange = (value: number) => {
    cone.angle = value
  }

  const handleRadiusChange = (value: number) => {
    cone.originRadius = value;
  }

  return (
    <>
      <label>
        Angle:
        <NumberInput value={cone.angle} onChange={handleAngleChange} />
      </label>
      <label>
        Radius:
        <NumberInput value={cone.originRadius} onChange={handleRadiusChange} />
      </label>
    </>
  )
})

export default Cone;
