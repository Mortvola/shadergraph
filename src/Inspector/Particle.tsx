import React from 'react';
import ParticleSystem from '../Renderer/ParticleSystem';
import NumberInput from './NumberInput';
import Http from '../Http/src';

type PropsType = {
  particleSystem: ParticleSystem,
}

const Particle: React.FC<PropsType> = ({
  particleSystem,
}) => {
  const handleMaxPointsChange = (value: number) => {
    particleSystem.maxPoints = value;
    save()
  }

  const handleRateChange = (value: number) => {
    particleSystem.rate = value;
    save()
  }

  const handleAngleChange = (value: number) => {
    particleSystem.angle = value;
    save()
  }

  const handleRadiusChange = (value: number) => {
    particleSystem.originRadius = value;
    save()
  }

  const handleVelocityChange = (value: number) => {
    particleSystem.initialVelocity = value;
    save()
  }

  const handleMinLifetimeChange = (value: number) => {
    particleSystem.minLifetime = value;
    save()
  }

  const handleMaxLifetimeChange = (value: number) => {
    particleSystem.maxLifetime = value;
    save()
  }

  const handleInitialSizeChange = (value: number) => {
    particleSystem.initialeSize = value;
    save()
  }

  const handleFinalSizeChange = (value: number) => {
    particleSystem.finalSize = value;
    save()
  }

  const save = async () => {
    const response = await Http.patch(`/particles/${particleSystem.id}`, {
      descriptor: particleSystem.getDescriptor(),
    })

    if (response.ok) {

    }
  }

  return (
    <div>
      <div>
        Number of Particles:
        <NumberInput value={particleSystem.maxPoints} onChange={handleMaxPointsChange} />
      </div>
      <div>
        Emission Rate:
        <NumberInput value={particleSystem.rate} onChange={handleRateChange} />
      </div>
      <div>
        Angle:
        <NumberInput value={particleSystem.angle} onChange={handleAngleChange} />
      </div>
      <div>
        Radius:
        <NumberInput value={particleSystem.originRadius} onChange={handleRadiusChange} />
      </div>
      <div>
        Initial Velocity:
        <NumberInput value={particleSystem.initialVelocity} onChange={handleVelocityChange} />
      </div>
      <div>
        Min Lifetime:
        <NumberInput value={particleSystem.minLifetime} onChange={handleMinLifetimeChange} />
      </div>
      <div>
        Max Lifetime:
        <NumberInput value={particleSystem.maxLifetime} onChange={handleMaxLifetimeChange} />
      </div>
      <div>
        Initial Size:
        <NumberInput value={particleSystem.initialeSize} onChange={handleInitialSizeChange} />
      </div>
      <div>
        Final Size:
        <NumberInput value={particleSystem.finalSize} onChange={handleFinalSizeChange} />
      </div>
    </div>
  )
}

export default Particle;
