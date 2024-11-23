import React from 'react';
import styles from './Inspector.module.scss';
import Select from './Select';
import { observer } from 'mobx-react-lite';
import type { PropertyBaseInterface } from '../Renderer/Properties/Types';
import type TreeNode from '../Scene/Types/TreeNode';
import { type ComponentType } from '../Renderer/Types';

type PropsType = {
  label: string,
  property: PropertyBaseInterface,
  children?: React.ReactNode,
  onDragOver?: (event: React.DragEvent<HTMLLabelElement>) => void,
  onDrop?: (event: React.DragEvent<HTMLLabelElement>) => void,
  className?: string,
  node: TreeNode,
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
  node,
  componentType,
  propertyPath,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  const options = [
    { action: () => { property.revertOverride() }, label: 'Revert Override' },
  ]

  const applyOptions = () => {
    const targets = node.scene.getApplyTargets(node, componentType, propertyPath)
    return [
      ...targets,
      ...options,
    ]
  }

  const handleOpenClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
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

  const handleLabelClick: React.MouseEventHandler<HTMLLabelElement> = (event) => {
    event.stopPropagation()
    event.preventDefault()
  }

  return (
    <label
      className={`${styles.property} ${className ?? ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={handleLabelClick}
    >
      <div
        ref={ref}
        className={property.override ? styles.overriden : undefined}
        onClick={handleOpenClick}
      >
        {`${label}:`}
      </div>
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
    </label>
  )
})

export default Property;
