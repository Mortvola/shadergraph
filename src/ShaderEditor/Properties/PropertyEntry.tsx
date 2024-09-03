import React from 'react';
import type { PropertyInterface} from '../../Renderer/ShaderBuilder/Types';
import { convertType } from '../../Renderer/ShaderBuilder/Types';
import styles from './Properties.module.scss';

type PropsType = {
  property: PropertyInterface,
  onEdit: (property: PropertyInterface, x: number, y: number) => void,
}

const PropertyEntry: React.FC<PropsType> = ({
  property,
  onEdit,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleClick: React.MouseEventHandler = (event) => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      onEdit(property, rect.right, rect.top)
    }
  }

  const handlePointerDown: React.PointerEventHandler = (event) => {
    event.stopPropagation();
  }

  return (
    <div ref={ref} key={property.name} className={styles.item} onClick={handleClick} onPointerDown={handlePointerDown}>
      <div>{property.name}</div>
      <div>{convertType(property.value.dataType)}</div>
    </div>
  )
}

export default PropertyEntry;
