import React from 'react';
import ShapeTypeSelector from './ShapeTypeSelector';
import type Shape from '../../../Renderer/ParticleSystem/Shapes/Shape';
import { ShapeType } from '../../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';
import Cone from './Cone';
import styles from '../PSModule.module.scss';
import Sphere from './Sphere';
import Property from '../../Property';

type PropsType = {
  shape: Shape,
}

const ShapeModule: React.FC<PropsType> = observer(({
  shape,
}) => {
  const handleShapeTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    shape.type.set(event.target.value as ShapeType, true);
  }

  return (
    <div className={styles.shape}>
      <Property label="Shape" property={shape.type}>
        <ShapeTypeSelector value={shape.type.get()} onChange={handleShapeTypeChange} />
      </Property>
      {
        (() => {
          switch (shape.type.get()) {
            case ShapeType.Cone:
              return <Cone cone={shape.cone} />

            case ShapeType.Sphere:
              return <Sphere sphere={shape.sphere} />

            case ShapeType.Hemisphere:
              return <Sphere sphere={shape.hemisphere} />
  
            default:
              return null;
          }
        })()
      }
    </div>
  )
})

export default ShapeModule;
