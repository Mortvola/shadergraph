import React from 'react';
import { createPortal } from 'react-dom';
import styles from './Select.module.scss';
import PropertyBase from '../Renderer/Properties/PropertyBase';

type PropsType = {
  onSelect: (value: PropertyBase | undefined) => void,
  onClose: () => void,
  rect: DOMRect,
  options?: { value: PropertyBase | undefined, label: string }[],
}

const Select: React.FC<PropsType> = ({
  onSelect,
  onClose,
  rect,
  options = [],
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [wrapperBounds, setWrapperBounds] = React.useState<DOMRect>();

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleClose: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    onClose();
  }

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setWrapperBounds(rect);
    }
  }, [])

  const handleSelect = (value: PropertyBase | undefined) => {
    onSelect(value);
    onClose()
  }

  return (
    createPortal(
      <div
        ref={ref}
        className={styles.wrapper}
        onClick={handleClose}
      >
        {
          wrapperBounds
            ? (
              <div
                className={styles.popup}
                style={{ left: rect.left, bottom: wrapperBounds!.bottom - rect.top }}
                onClick={handleClick}
              >
                {
                  options.map((o) => (
                    <div key={o.label} className={styles.item} onClick={() => handleSelect(o.value)}>{o.label}</div>
                  ))
                }
              </div>
            )
            : null
        }
      </div>,
      document.body,
    )
  )
}

export default Select;
