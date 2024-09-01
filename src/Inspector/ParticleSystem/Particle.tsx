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
    particleSystemProps.duration.set(value, true);
  }

  const handleMaxPointsChange = (value: number) => {
    particleSystemProps.maxPoints.set(value, true);
  }

  const handleRateChange = (value: number) => {
    particleSystemProps.rate.set(value, true);
  }

  return (
    <div className={styles.particle}>
      <label>
        Duration:
        <NumberInput value={particleSystemProps.duration.get()} onChange={handleDurationChange} />
      </label>
      <label>
        Maximum Particles:
        <NumberInput value={particleSystemProps.maxPoints.get()} onChange={handleMaxPointsChange} />
      </label>
      <label>
        Emission Rate:
        <NumberInput value={particleSystemProps.rate.get()} onChange={handleRateChange} />
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
        <label>
          Size:
          <PSValueInput value={particleSystemProps.lifetimeSize.size} />
        </label>
      </PSModule>
      <PSModule title="Color over lifetime" module={particleSystemProps.lifetimeColor}>
        <label>
          Color:
          <PSColorInput value={particleSystemProps.lifetimeColor.color} />        
        </label>
      </PSModule>
      <PSModule title="Velocity over lifetime" module={particleSystemProps.lifetimeVelocity}>
        <label>
          Speed Modifier:
          <PSValueInput value={particleSystemProps.lifetimeVelocity.speedModifier} />        
        </label>
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
