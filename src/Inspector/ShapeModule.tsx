import React from 'react';
import ShapeTypeSelector from './ShapeTypeSelector';
import Shape from '../Renderer/ParticleSystem/Shapes/Shape';
import { ShapeType } from '../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';
import Cone from './Cone';
import styles from './PSModule.module.scss';
import Sphere from './Sphere';

type PropsType = {
  shape: Shape,
}

const ShapeModule: React.FC<PropsType> = observer(({
  shape,
}) => {
  const handleShapeTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    shape.setType(event.target.value as ShapeType)
  }

  return (
    <div className={styles.shape}>
      <label>
        Shape:
        <ShapeTypeSelector value={shape.type} onChange={handleShapeTypeChange} />
      </label>
      {
        (() => {
          switch (shape.type) {
            case ShapeType.Cone:
              return <Cone cone={shape.cone} />

            case ShapeType.Sphere:
              return <Sphere sphere={shape.sphere} />
              
            default:
              return null;
          }
        })()
      }
    </div>
  )
})

export default ShapeModule;
