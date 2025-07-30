import React from 'react';
import NumberInput from '../NumberInput';
import type CollisionData from '../../Renderer/ParticleSystem/Collision';
import Property from '../Property';
import type SceneNode from '../../Scene/Types/SceneNode';
import { ComponentType } from '../../Renderer/Types';

type PropsType = {
  value: CollisionData
  sceneNode: SceneNode,
}

const Collision: React.FC<PropsType> = ({
  value,
  sceneNode,
}) => {
  const handleBounceChange = (bounce: number) => {
    value.bounce.set(bounce, !sceneNode.isTopLevel)
  }

  const handleDampenChange = (dampen: number) => {
    value.dampen.set(dampen, !sceneNode.isTopLevel)
  }

  return (
    <>
      <Property
        label="Bounce"
        property={value.bounce}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="bounce"
      >
        <NumberInput value={value.bounce.get()} onChange={handleBounceChange} />
      </Property>
      <Property
        label="Dampen"
        property={value.dampen}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="dampen"
      >
        <NumberInput value={value.dampen.get()} onChange={handleDampenChange} />
      </Property>
    </>
  )
}

export default Collision;
