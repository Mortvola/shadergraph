import React from 'react';
import ParticleSystem from '../Renderer/ParticleSystem';
import NumberInput from './NumberInput';
import Http from '../Http/src';
import styles from './Particle.module.scss';
import ColorPicker from './ColorPicker';
import { useStores } from '../State/store';
import { materialManager } from '../Renderer/Materials/MaterialManager';
import { particleSystemManager } from '../Renderer/ParticleSystemManager';
import { ParticleItem } from '../Renderer/types';

type PropsType = {
  particleItem: ParticleItem,
}

const Particle: React.FC<PropsType> = ({
  particleItem,
}) => {  
  const store = useStores()

  const [particleSystem, setParticleSystem] = React.useState<ParticleSystem | null>(null)

  React.useEffect(() => {
    (async () => {
      const ps = await particleSystemManager.getParticleSystem(particleItem.id)

      if (ps) {
        setParticleSystem(ps);
      }
    })()
  }, [particleItem.id])

  if (particleSystem === null) {
    return null
  }

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

  const handleColor1AChange = (value: number[]) => {
    particleSystem.initialColor[0] = value.slice();
    save()
  }

  const handleColor2AChange = (value: number[]) => {
    particleSystem.initialColor[1] = value.slice();
    save()
  }

  const save = async () => {
    const response = await Http.patch(`/particles/${particleSystem.id}`, {
      descriptor: particleSystem.getDescriptor(),
    })

    if (response.ok) {

    }
  }

  const handleDragOver: React.DragEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    
    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && store.draggingItem.type === 'material'
    ) {
      event.dataTransfer.dropEffect = 'link';
    }
  }

  const handleDrop: React.DragEventHandler = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && store.draggingItem
      && store.draggingItem.type === 'material'
      && store.draggingItem.itemId !== null
    ) {
      const materialDescriptor = await materialManager.getDescriptor(store.draggingItem.itemId, false)

      if (materialDescriptor) {
        particleSystem.materialId = store.draggingItem.itemId
        particleSystem.materialDescriptor = materialDescriptor
      }
    }
  }

  return (
    <div className={styles.particle} onDragOver={handleDragOver} onDrop={handleDrop}>
      <label>
        Number of Particles:
        <NumberInput value={particleSystem.maxPoints} onChange={handleMaxPointsChange} />
      </label>
      <label>
        Emission Rate:
        <NumberInput value={particleSystem.rate} onChange={handleRateChange} />
      </label>
      <label>
        Angle:
        <NumberInput value={particleSystem.angle} onChange={handleAngleChange} />
      </label>
      <label>
        Radius:
        <NumberInput value={particleSystem.originRadius} onChange={handleRadiusChange} />
      </label>
      <label>
        Initial Velocity:
        <NumberInput value={particleSystem.initialVelocity} onChange={handleVelocityChange} />
      </label>
      <label>
        Min Lifetime:
        <NumberInput value={particleSystem.minLifetime} onChange={handleMinLifetimeChange} />
      </label>
      <label>
        Max Lifetime:
        <NumberInput value={particleSystem.maxLifetime} onChange={handleMaxLifetimeChange} />
      </label>
      <label>
        Initial Size:
        <NumberInput value={particleSystem.initialeSize} onChange={handleInitialSizeChange} />
      </label>
      <label>
        Final Size:
        <NumberInput value={particleSystem.finalSize} onChange={handleFinalSizeChange} />
      </label>
      <label>
        Initial Color:
        <div>
          <ColorPicker value={particleSystem.initialColor[0]} onChange={handleColor1AChange} />
          <ColorPicker value={particleSystem.initialColor[1]} onChange={handleColor2AChange} />
        </div>
      </label>
      <label>
        Material:
        <div>
          {
            particleSystem.materialDescriptor
              ? 'yes'
              : 'no'
          }
        </div>
      </label>
    </div>
  )
}

export default Particle;
