import React from 'react';
import NumberInput from '../../NumberInput';
import SphereData from '../../../Renderer/ParticleSystem/Shapes/Sphere';
import { observer } from 'mobx-react-lite';

type PropsType = {
  sphere: SphereData
}

const Sphere: React.FC<PropsType> = observer(({
  sphere,
}) => {
  const handleRadiusChange = (value: number) => {
    sphere.setRadius(value)
  }

  return (
    <>
      <label>
        Radius:
        <NumberInput value={sphere.radius} onChange={handleRadiusChange} />
      </label>
    </>
  )
})

export default Sphere;
