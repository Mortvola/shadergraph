import React from 'react';
import NumberInput from '../NumberInput';
import CollisionData from '../../Renderer/ParticleSystem/Collision';

type PropsType = {
  value: CollisionData
}

const Collision: React.FC<PropsType> = ({
  value
}) => {
  const handleBounceChange = (bounce: number) => {
    value.bounce = bounce
  }

  const handleDampenChange = (dampen: number) => {
    value.dampen = dampen;
  }

  return (
    <>
      <label>
        Bounce:
        <NumberInput value={value.bounce} onChange={handleBounceChange} />
      </label>
      <label>
        Dampen:
        <NumberInput value={value.dampen} onChange={handleDampenChange} />
      </label>
    </>
  )
}

export default Collision;
