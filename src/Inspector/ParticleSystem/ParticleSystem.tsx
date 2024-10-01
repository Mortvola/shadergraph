import React from 'react';
import NumberInput from '../NumberInput';
import styles from './Particle.module.scss';
import { observer } from 'mobx-react-lite';
import PSValueInput from './PSValueInput';
import PSColorInput from './PSColorInput';
import ShapeModule from './Shapes/ShapeModule';
import PSModule from './PSModule';
import Collision from './Collision';
import PSRenderer from './PSRenderer';
import type ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';
import Property from '../Property';
import { type SpaceType } from '../../Renderer/ParticleSystem/Types';
import PSSpaceTypeSelector from './PSSpaceTypeSelector';
import PSValue3DInput from './PSValue3DInput';

type PropsType = {
  particleSystemProps: ParticleSystemProps,
}

const ParticleSystem: React.FC<PropsType> = observer(({
  particleSystemProps,
}) => {  
  if (particleSystemProps === null) {
    return null
  }

  const handleDurationChange = (value: number) => {
    particleSystemProps.duration.set(value, true);
  }

  const handleMaxPointsChange = (value: number) => {
    particleSystemProps.maxPoints.set(value, true);
  }

  const handleRateChange = (value: number) => {
    particleSystemProps.rate.set(value, true);
  }

  const handleSpaceChange = (value: SpaceType) => {
    particleSystemProps.space.set(value, true);
  }

  return (
    <div className={styles.particle}>
      <Property label="Duration" property={particleSystemProps.duration}>
        <NumberInput value={particleSystemProps.duration.get()} onChange={handleDurationChange} />
      </Property>
      <Property label="Maximum Particles" property={particleSystemProps.maxPoints}>
        <NumberInput value={particleSystemProps.maxPoints.get()} onChange={handleMaxPointsChange} />
      </Property>
      <Property label="Emission Rate" property={particleSystemProps.rate}>
        <NumberInput value={particleSystemProps.rate.get()} onChange={handleRateChange} />
      </Property>
      <Property label="Lifetime" property={particleSystemProps.lifetime}>
        <PSValueInput value={particleSystemProps.lifetime} />
      </Property>
      <Property label="Start Speed" property={particleSystemProps.startSpeed}>
        <PSValueInput value={particleSystemProps.startSpeed} />
      </Property>
      <Property label="Start Size" property={particleSystemProps.startSize}>
        <PSValue3DInput value={particleSystemProps.startSize} />
      </Property>
      <Property label="Start Rotation" property={particleSystemProps.startRotation}>
        <PSValue3DInput value={particleSystemProps.startRotation} />
      </Property>
      <Property label="Start Color" property={particleSystemProps.startColor}>
        <PSColorInput value={particleSystemProps.startColor} />
      </Property>
      <Property label="Space" property={particleSystemProps.space}>
        <PSSpaceTypeSelector value={particleSystemProps.space.get()} onChange={handleSpaceChange} />
      </Property>
      <Property label="Gravity Modifier" property={particleSystemProps.gravityModifier}>
        <PSValueInput value={particleSystemProps.gravityModifier} />
      </Property>
      <PSModule title="Shape" module={particleSystemProps.shape}>
        <ShapeModule shape={particleSystemProps.shape} />
      </PSModule>
      <PSModule title="Size over lifetime" module={particleSystemProps.lifetimeSize}>
        <Property label="Size" property={particleSystemProps.lifetimeSize.size}>
          <PSValueInput value={particleSystemProps.lifetimeSize.size} />
        </Property>
      </PSModule>
      <PSModule title="Color over lifetime" module={particleSystemProps.lifetimeColor}>
        <Property label="Color" property={particleSystemProps.lifetimeColor.color}>
          <PSColorInput value={particleSystemProps.lifetimeColor.color} />
        </Property>
      </PSModule>
      <PSModule title="Velocity over lifetime" module={particleSystemProps.lifetimeVelocity}>
        <Property label="Speed Modifier" property={particleSystemProps.lifetimeVelocity.speedModifier}>
          <PSValueInput value={particleSystemProps.lifetimeVelocity.speedModifier} />
        </Property>
      </PSModule>
      <PSModule title="Collsion" module={particleSystemProps.collision}>
        <Collision value={particleSystemProps.collision} />
      </PSModule>
      <PSModule title="Renderer" module={particleSystemProps.renderer}>
        <PSRenderer value={particleSystemProps.renderer} />
      </PSModule>
    </div>
  )
})

export default ParticleSystem;
