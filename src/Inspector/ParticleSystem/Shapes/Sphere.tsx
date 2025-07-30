import React from 'react';
import NumberInput from '../../NumberInput';
import type SphereData from '../../../Renderer/ParticleSystem/Shapes/Sphere';
import { observer } from 'mobx-react-lite';
import type SceneNode from '../../../Scene/Types/SceneNode';

type PropsType = {
  sphere: SphereData
  sceneNode: SceneNode,
}

const Sphere: React.FC<PropsType> = observer(({
  sphere,
  sceneNode,
}) => {
  const handleRadiusChange = (value: number) => {
    sphere.radius.set(value, !sceneNode.isTopLevel)
  }

  return (
    <>
      <label>
        Radius:
        <NumberInput value={sphere.radius.get()} onChange={handleRadiusChange} />
      </label>
    </>
  )
})

export default Sphere;
