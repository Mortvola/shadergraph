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
    value.bounce.value = bounce
  }

  const handleDampenChange = (dampen: number) => {
    value.dampen.value = dampen;
  }

  return (
    <>
      <label>
        Bounce:
        <NumberInput value={value.bounce.value} onChange={handleBounceChange} />
      </label>
      <label>
        Dampen:
        <NumberInput value={value.dampen.value} onChange={handleDampenChange} />
      </label>
    </>
  )
}

export default Collision;
