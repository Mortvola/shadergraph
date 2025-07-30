import React from 'react';
import NumberInput from '../../NumberInput';
import type ConeData from '../../../Renderer/ParticleSystem/Shapes/Cone';
import { observer } from 'mobx-react-lite';
import type SceneNode from '../../../Scene/Types/SceneNode';

type PropsType = {
  cone: ConeData,
  sceneNode: SceneNode,
}

const Cone: React.FC<PropsType> = observer(({
  cone,
  sceneNode,
}) => {
  const handleAngleChange = (value: number) => {
    cone.angle.set(value, !sceneNode.isTopLevel);
  }

  const handleRadiusChange = (value: number) => {
    cone.originRadius.set(value, !sceneNode.isTopLevel);
  }

  return (
    <>
      <label>
        Angle:
        <NumberInput value={cone.angle.get()} onChange={handleAngleChange} />
      </label>
      <label>
        Radius:
        <NumberInput value={cone.originRadius.get()} onChange={handleRadiusChange} />
      </label>
    </>
  )
})

export default Cone;
