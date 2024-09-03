import React from 'react';
import styles from './Inspector.module.scss';
import Select from './Select';
import { observer } from 'mobx-react-lite';
import { PropertyBaseInterface } from '../Renderer/Properties/Types';

type PropsType = {
  label: string,
  property: PropertyBaseInterface,
  children?: React.ReactNode,
  onDragOver?: (event: React.DragEvent<HTMLLabelElement>) => void,
  onDrop?: (event: React.DragEvent<HTMLLabelElement>) => void,
}

const Property: React.FC<PropsType> = observer(({
  label,
  property,
  children,
  onDragOver,
  onDrop,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [lineage, setLineage] = React.useState<{ value: string, label: string }[]>([])

  const options = [
    { value: 'revert', label: 'Revert Override' },
  ]

  const handleOpenClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();

    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setLineage(property.getLineage().map((l) => ({
        value: l.id.toString(),
        label: `Apply to ${l.name} in ${l.container}`,
      })))

      setOpen(rect);
    }
  }

  const handleClose = () => {
    setOpen(null);
  }

  const onSelect = (value: string) => {
    if (value === "revert") {
      property.revertOverride()
    }
  }

  return (
    <label
      className={styles.property}
      onDragOver={onDragOver}
      onDrop={onDrop}
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
          ? <Select onSelect={onSelect} onClose={handleClose} rect={open} options={[...lineage, ...options]} />
          : null
      }
    </label>
  )
})

export default Property;
