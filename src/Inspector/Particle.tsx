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
  const hexToRGB = (hex: string): [number, number, number, number] => {
    let alpha = false;
    let h = hex.slice(hex.startsWith('#') ? 1 : 0);

    if (h.length === 3) {
      h = [...h].map(x => x + x).join('');
    }
    else if (h.length === 8) {
      alpha = true;
    }

    const value = parseInt(h, 16);

    return [
      (value >>> (alpha ? 24 : 16)) / 255,
      ((value & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) / 255,
      ((value & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) / 255,
      1,
    ]
  };

  const rgbToHex = (color: number[]) => {
    const red = (Math.trunc(color[0] * 255)).toString(16).padStart(2, '0')
    const green = (Math.trunc(color[1] * 255)).toString(16).padStart(2, '0')
    const blue = (Math.trunc(color[2] * 255)).toString(16).padStart(2, '0')
    
    return `#${red}${green}${blue}`
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

  const handleColor1Change: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    particleSystem.initialColor[0] = hexToRGB(event.target.value);
    save()
  }

  const handleColor2Change: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    particleSystem.initialColor[1] = hexToRGB(event.target.value);
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
      <div>
        Initial Color:
        <div>
          <input type="color" value={rgbToHex(particleSystem.initialColor[0])} onChange={handleColor1Change} />
          <input type="color" value={rgbToHex(particleSystem.initialColor[1])} onChange={handleColor2Change} />
        </div>
      </div>
    </div>
  )
}

export default Particle;
