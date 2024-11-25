import React from 'react';
import NumberInput from '../../NumberInput';
import type SphereData from '../../../Renderer/ParticleSystem/Shapes/Sphere';
import { observer } from 'mobx-react-lite';
import type TreeNode from '../../../Scene/Types/TreeNode';

type PropsType = {
  sphere: SphereData
  node: TreeNode,
}

const Sphere: React.FC<PropsType> = observer(({
  sphere,
  node,
}) => {
  const handleRadiusChange = (value: number) => {
    sphere.radius.set(value, !node.isTopLevel)
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
