import React from 'react';
import ParticleSystem from '../Renderer/ParticleSystem';
import NumberInput from './NumberInput';
import Http from '../Http/src';
import styles from './Particle.module.scss';
import ColorPicker from '../Color/ColorPicker';
import { useStores } from '../State/store';
import { materialManager } from '../Renderer/Materials/MaterialManager';
import { particleSystemManager } from '../Renderer/ParticleSystemManager';
import { ParticleItem, PSValue } from '../Renderer/types';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import PSValueInput from './PSValueInput';
import Checkbox from '../ShaderEditor/Controls/Checkbox';

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

  const handleDurationChange = (value: number) => {
    runInAction(() => {
      particleSystem.duration = value;
      save()  
    })
  }

  const handleMaxPointsChange = (value: number) => {
    runInAction(() => {
      particleSystem.maxPoints = value;
      save()  
    })
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
    runInAction(() => {
      particleSystem.startColor = [
        value.slice(),
        [...particleSystem.startColor[1]],
      ];
      save()  
    })
  }

  const handleColor2AChange = (value: number[]) => {
    runInAction(() => {
      particleSystem.startColor = [
        [...particleSystem.startColor[0]],
        value.slice(),
      ];  
      save()
    })
  }

  const handleGravityChange = (value: number) => {
    runInAction(() => {
      particleSystem.gravityModifier = value;
      save();
    })
  }

  const handleCollisionChange = (value: boolean) => {
    runInAction(() => {
      particleSystem.collisionEnabled = !particleSystem.collisionEnabled;
      save();
    })
  }

  const handleBounceChange = (value: number) => {
    runInAction(() => {
      particleSystem.bounce = value;
      save()  
    })
  }

  const handleDampenChange = (value: number) => {
    runInAction(() => {
      particleSystem.dampen = value;
      save()  
    })
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
        <NumberInput value={particleSystem.duration} onChange={handleDurationChange} />
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
        Start Color:
        <div>
          <ColorPicker value={particleSystem.startColor[0]} onChange={handleColor1AChange} useAlpha useHdr />
          <ColorPicker value={particleSystem.startColor[1]} onChange={handleColor2AChange} useAlpha useHdr />
        </div>
      </label>
      <label>
        Gravity Modifier:
        <NumberInput value={particleSystem.gravityModifier} onChange={handleGravityChange} />
      </label>
      <Checkbox label="Collision" value={particleSystem.collisionEnabled} onChange={handleCollisionChange} />
      <label>
        Bounce:
        <NumberInput value={particleSystem.bounce} onChange={handleBounceChange} />
      </label>
      <label>
        Dampen:
        <NumberInput value={particleSystem.dampen} onChange={handleDampenChange} />
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
