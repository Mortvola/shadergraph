import React from 'react';
import ParticleSystem from '../Renderer/ParticleSystem';
import NumberInput from './NumberInput';
import Http from '../Http/src';
import styles from './Particle.module.scss';
import ColorPicker from './ColorPicker';
import { useStores } from '../State/store';
import { materialManager } from '../Renderer/Materials/MaterialManager';
import { particleSystemManager } from '../Renderer/ParticleSystemManager';
import { ParticleItem, PSValue } from '../Renderer/types';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import PSValueInput from './PSValueInput';

type PropsType = {
  particleItem: ParticleItem,
}

const Particle: React.FC<PropsType> = observer(({
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

  const handleVelocityChange = (value: PSValue) => {
    particleSystem.startVelocity = value;
    save()
  }

  const handleLifetimeChange = (value: PSValue) => {
    runInAction(() => {
      particleSystem.lifetime = value
      save()
    })
  }

  const handleStartSizeChange = (value: PSValue) => {
    runInAction(() => {
      particleSystem.startSize = value
      save()
    })
  }

  const handleSizeChange = (value: PSValue) => {
    runInAction(() => {
      particleSystem.size = value
      save()
    })
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

    const draggingItem = store.draggingItem;

    if (
      event.dataTransfer.types[0] === 'application/project-item'
      && draggingItem
      && draggingItem.type === 'material'
      && draggingItem.itemId !== null
    ) {
      const materialDescriptor = await materialManager.getDescriptor(draggingItem.itemId, false)

      if (materialDescriptor) {
        particleSystem.materialId = draggingItem.itemId
        particleSystem.materialDescriptor = materialDescriptor
      }
    }
  }

  return (
    <div className={styles.particle} onDragOver={handleDragOver} onDrop={handleDrop}>
      <label>
        Duration:
        <NumberInput value={particleSystem.duration} onChange={handleMaxPointsChange} />
      </label>
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
        Lifetime:
        <PSValueInput value={particleSystem.lifetime} onChange={handleLifetimeChange} />
      </label>
      <label>
        Start Velocity:
        <PSValueInput value={particleSystem.startVelocity} onChange={handleVelocityChange} />
      </label>
      <label>
        Start Size:
        <PSValueInput value={particleSystem.startSize} onChange={handleStartSizeChange} />
      </label>
      <label>
        Size over lifetime:
        <PSValueInput value={particleSystem.size} onChange={handleSizeChange} />
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
})

export default Particle;
