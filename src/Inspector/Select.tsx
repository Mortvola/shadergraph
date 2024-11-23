import React from 'react';
import { createPortal } from 'react-dom';
import styles from './Select.module.scss';

type PropsType = {
  onSelect: (action: (() => void) | undefined) => void,
  onClose: () => void,
  rect: DOMRect,
  options?: { action: (() => void) | undefined, label: string }[],
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

  const handleSelect = (action: (() => void) | undefined) => {
    onSelect(action);
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
                    <div key={o.label} className={styles.item} onClick={() => handleSelect(o.action)}>{o.label}</div>
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
