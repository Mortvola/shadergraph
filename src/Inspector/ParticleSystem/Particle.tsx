import React from 'react';
import ParticleSystem from '../../Renderer/ParticleSystem/ParticleSystem';
import NumberInput from '../NumberInput';
import styles from './Particle.module.scss';
import { useStores } from '../../State/store';
import { materialManager } from '../../Renderer/Materials/MaterialManager';
import { particleSystemManager } from '../../Renderer/ParticleSystem/ParticleSystemManager';
import { ParticleItem, ParticleSystemInterface } from '../../Renderer/types';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import PSValueInput from './PSValueInput';
import PSColorInput from './PSColorInput';
import ShapeModule from './Shapes/ShapeModule';
import PSModule from './PSModule';
import Collision from './Collision';
import PSRenderer from './PSRenderer';

type PropsType = {
  particleSystem: ParticleSystem,
}

const Particle: React.FC<PropsType> = observer(({
  particleSystem,
}) => {  
  const store = useStores()

  // const [particleSystem, setParticleSystem] = React.useState<ParticleSystem | null>(null)

  // React.useEffect(() => {
  //   (async () => {
  //     const ps = await particleSystemManager.getParticleSystem(particleItem.id)

  //     if (ps) {
  //       setParticleSystem(ps);
  //     }
  //   })()
  // }, [particleItem.id])

  if (particleSystem === null) {
    return null
  }

  const handleDurationChange = (value: number) => {
    runInAction(() => {
      particleSystem.duration = value;

      if (particleSystem.handleChange) {
        particleSystem.handleChange()
      }
    })
  }

  const handleMaxPointsChange = (value: number) => {
    runInAction(() => {
      particleSystem.maxPoints = value;

      if (particleSystem.handleChange) {
        particleSystem.handleChange()
      }
    })
  }

  const handleRateChange = (value: number) => {
    particleSystem.rate = value;

    if (particleSystem.handleChange) {
      particleSystem.handleChange()
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
      const materialItem = await materialManager.getItem(draggingItem.itemId, false)

      if (materialItem) {
        particleSystem.setMaterial(materialItem)
      }
    }
  }

  return (
    <div className={styles.particle} onDragOver={handleDragOver} onDrop={handleDrop}>
      <label>
        Duration:
        <NumberInput value={particleSystem.duration} onChange={handleDurationChange} />
      </label>
      <label>
        Maximum Particles:
        <NumberInput value={particleSystem.maxPoints} onChange={handleMaxPointsChange} />
      </label>
      <label>
        Emission Rate:
        <NumberInput value={particleSystem.rate} onChange={handleRateChange} />
      </label>
      <label>
        Lifetime:
        <PSValueInput value={particleSystem.lifetime} />
      </label>
      <label>
        Start Velocity:
        <PSValueInput value={particleSystem.startVelocity} />
      </label>
      <label>
        Start Size:
        <PSValueInput value={particleSystem.startSize} />
      </label>
      <label>
        Start Color:
        <PSColorInput value={particleSystem.startColor} />
      </label>
      <label>
        Gravity Modifier:
        <PSValueInput value={particleSystem.gravityModifier} />
      </label>
      <PSModule title="Shape" module={particleSystem.shape}>
        <ShapeModule shape={particleSystem.shape} />
      </PSModule>
      <PSModule title="Size over lifetime" module={particleSystem.lifetimeSize}>
        <PSValueInput value={particleSystem.lifetimeSize.size} />
      </PSModule>
      <PSModule title="Color over lifetime" module={particleSystem.lifetimeColor}>
        <PSColorInput value={particleSystem.lifetimeColor.color} />        
      </PSModule>
      <PSModule title="Velocity over lifetime" module={particleSystem.lifetimeVelocity}>
        <PSValueInput value={particleSystem.lifetimeVelocity.speedModifier} />        
      </PSModule>
      <PSModule title="Collsion" module={particleSystem.collision}>
        <Collision value={particleSystem.collision} />
      </PSModule>
      <PSModule title="Renderer" module={particleSystem.renderer}>
        <PSRenderer value={particleSystem.renderer} />
      </PSModule>
      <label>
        Material:
        <div>
          {
            particleSystem.materialItem
              ? particleSystem.materialItem.name
              : 'not assigned'
          }
        </div>
      </label>
    </div>
  )
})

export default Particle;
