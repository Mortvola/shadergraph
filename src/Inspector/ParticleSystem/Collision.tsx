import React from 'react';
import NumberInput from '../NumberInput';
import type CollisionData from '../../Renderer/ParticleSystem/Collision';
import Property from '../Property';

type PropsType = {
  value: CollisionData
}

const Collision: React.FC<PropsType> = ({
  value
}) => {
  const handleBounceChange = (bounce: number) => {
    value.bounce.set(bounce, true)
  }

  const handleDampenChange = (dampen: number) => {
    value.dampen.set(dampen, true)
  }

  return (
    <>
      <Property label="Bounce" property={value.bounce}>
        <NumberInput value={value.bounce.get()} onChange={handleBounceChange} />
      </Property>
      <Property label="Dampen" property={value.dampen}>
        <NumberInput value={value.dampen.get()} onChange={handleDampenChange} />
      </Property>
    </>
  )
}

export default Collision;
