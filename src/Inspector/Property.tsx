import React from 'react';
import styles from './Property.module.scss';
import Select from './Select';
import { observer } from 'mobx-react-lite';
import type { PropertyBaseInterface } from '../Renderer/Properties/Types';
import type SceneNode from '../Scene/Types/SceneNode';
import { type ComponentType } from '../Renderer/Types';

type PropsType = {
  label: string,
  property: PropertyBaseInterface,
  children?: React.ReactNode,
  onDragOver?: (event: React.DragEvent<HTMLLabelElement>) => void,
  onDrop?: (event: React.DragEvent<HTMLLabelElement>) => void,
  className?: string,
  sceneNode: SceneNode,
  componentType: ComponentType,
  propertyPath: string,
}

const Property: React.FC<PropsType> = observer(({
  label,
  property,
  children,
  onDragOver,
  onDrop,
  className,
  sceneNode,
  componentType,
  propertyPath,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>(null);
  const ref = React.useRef<HTMLLabelElement>(null);

  const applyOptions = () => sceneNode.scene.getApplyTargets(sceneNode, componentType, propertyPath)

  const handleOpenClick: React.MouseEventHandler<HTMLLabelElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (property.override) {
      const element = ref.current;

      if (element) {
        const rect = element.getBoundingClientRect();

        setOpen(rect);
      }
    }
  }

  const handleClose = () => {
    setOpen(null);
  }

  const onSelect = (action: (() => void) | undefined) => {
    if (action !== undefined) {
      action()
    }
  }

  return (
    <div className={styles.property}>
      <label
        ref={ref}
        className={property.override ? styles.overriden : undefined}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={handleOpenClick}
      >
        {`${label}:`}
      </label>
      {children}
      {
        open
          ? (
            <Select
              onSelect={onSelect}
              onClose={handleClose}
              rect={open}
              options={applyOptions()}
            />
          )
          : null
      }
    </div>
  )
})

export default Property;
