import React from 'react';
import styles from './Inspector.module.scss';
import Select from './Select';

type PropsType = {
  label: string,
  property: { override: boolean, revertOverride: () => void },
  children?: React.ReactNode,
  onDragOver?: (event: React.DragEvent<HTMLLabelElement>) => void,
  onDrop?: (event: React.DragEvent<HTMLLabelElement>) => void,
}

const Property: React.FC<PropsType> = ({
  label,
  property,
  children,
  onDragOver,
  onDrop,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  const options = [
    { value: 'revert', label: 'Revert Override' },
  ]

  const handleOpenClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();

    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

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
          ? <Select onSelect={onSelect} onClose={handleClose} rect={open} options={options} />
          : null
      }
    </label>
  )
}

export default Property;
