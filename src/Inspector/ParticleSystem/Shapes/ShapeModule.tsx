import React from 'react';
import ShapeTypeSelector from './ShapeTypeSelector';
import type Shape from '../../../Renderer/ParticleSystem/Shapes/Shape';
import { ShapeType } from '../../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';
import Cone from './Cone';
import styles from '../PSModule.module.scss';
import Sphere from './Sphere';
import Property from '../../Property';
import type TreeNode from '../../../Scene/Types/TreeNode';
import { ComponentType } from '../../../Renderer/Types';

type PropsType = {
  shape: Shape,
  node: TreeNode,
}

const ShapeModule: React.FC<PropsType> = observer(({
  shape,
  node,
}) => {
  const handleShapeTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    shape.type.set(event.target.value as ShapeType, !node.isTopLevel);
  }

  return (
    <div className={styles.shape}>
      <Property
        label="Shape"
        property={shape.type}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="type"
      >
        <ShapeTypeSelector value={shape.type.get()} onChange={handleShapeTypeChange} />
      </Property>
      {
        (() => {
          switch (shape.type.get()) {
            case ShapeType.Cone:
              return <Cone cone={shape.cone} node={node} />

            case ShapeType.Sphere:
              return <Sphere sphere={shape.sphere} node={node} />

            case ShapeType.Hemisphere:
              return <Sphere sphere={shape.hemisphere} node={node} />

            default:
              return null;
          }
        })()
      }
    </div>
  )
})

export default ShapeModule;
