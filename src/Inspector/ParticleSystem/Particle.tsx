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
import ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';

type PropsType = {
  particleSystemProps: ParticleSystemProps,
}

const Particle: React.FC<PropsType> = observer(({
  particleSystemProps,
}) => {  
  if (particleSystemProps === null) {
    return null
  }

  const handleDurationChange = (value: number) => {
    particleSystemProps.duration = value;
  }

  const handleMaxPointsChange = (value: number) => {
    particleSystemProps.maxPoints = value;
  }

  const handleRateChange = (value: number) => {
    particleSystemProps.rate = value;
  }

  return (
    <div className={styles.particle}>
      <label>
        Duration:
        <NumberInput value={particleSystemProps.duration} onChange={handleDurationChange} />
      </label>
      <label>
        Maximum Particles:
        <NumberInput value={particleSystemProps.maxPoints} onChange={handleMaxPointsChange} />
      </label>
      <label>
        Emission Rate:
        <NumberInput value={particleSystemProps.rate} onChange={handleRateChange} />
      </label>
      <label>
        Lifetime:
        <PSValueInput value={particleSystemProps.lifetime} />
      </label>
      <label>
        Start Velocity:
        <PSValueInput value={particleSystemProps.startVelocity} />
      </label>
      <label>
        Start Size:
        <PSValueInput value={particleSystemProps.startSize} />
      </label>
      <label>
        Start Color:
        <PSColorInput value={particleSystemProps.startColor} />
      </label>
      <label>
        Gravity Modifier:
        <PSValueInput value={particleSystemProps.gravityModifier} />
      </label>
      <PSModule title="Shape" module={particleSystemProps.shape}>
        <ShapeModule shape={particleSystemProps.shape} />
      </PSModule>
      <PSModule title="Size over lifetime" module={particleSystemProps.lifetimeSize}>
        <PSValueInput value={particleSystemProps.lifetimeSize.size} />
      </PSModule>
      <PSModule title="Color over lifetime" module={particleSystemProps.lifetimeColor}>
        <PSColorInput value={particleSystemProps.lifetimeColor.color} />        
      </PSModule>
      <PSModule title="Velocity over lifetime" module={particleSystemProps.lifetimeVelocity}>
        <PSValueInput value={particleSystemProps.lifetimeVelocity.speedModifier} />        
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

export default Particle;
