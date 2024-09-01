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
    value.bounce.set(bounce, true)
  }

  const handleDampenChange = (dampen: number) => {
    value.dampen.set(dampen, true)
  }

  return (
    <>
      <label>
        Bounce:
        <NumberInput value={value.bounce.get()} onChange={handleBounceChange} />
      </label>
      <label>
        Dampen:
        <NumberInput value={value.dampen.get()} onChange={handleDampenChange} />
      </label>
    </>
  )
}

export default Collision;
