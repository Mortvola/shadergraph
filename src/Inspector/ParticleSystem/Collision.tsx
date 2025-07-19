import React from 'react';
import NumberInput from '../NumberInput';
import type CollisionData from '../../Renderer/ParticleSystem/Collision';
import Property from '../Property';
import type SceneNode from '../../Scene/Types/SceneNode';
import { ComponentType } from '../../Renderer/Types';

type PropsType = {
  value: CollisionData
  node: SceneNode,
}

const Collision: React.FC<PropsType> = ({
  value,
  node,
}) => {
  const handleBounceChange = (bounce: number) => {
    value.bounce.set(bounce, !node.isTopLevel)
  }

  const handleDampenChange = (dampen: number) => {
    value.dampen.set(dampen, !node.isTopLevel)
  }

  return (
    <>
      <Property
        label="Bounce"
        property={value.bounce}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="bounce"
      >
        <NumberInput value={value.bounce.get()} onChange={handleBounceChange} />
      </Property>
      <Property
        label="Dampen"
        property={value.dampen}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="dampen"
      >
        <NumberInput value={value.dampen.get()} onChange={handleDampenChange} />
      </Property>
    </>
  )
}

export default Collision;
