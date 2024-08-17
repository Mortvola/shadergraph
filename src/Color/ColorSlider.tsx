import React from 'react';
import styles from './ColorPicker.module.scss';

type PropsType = {
  value?: number,
  className?: string,
  style?: React.CSSProperties,
  min?: number,
  max?: number,
  onChange?: (value: number) => void,
}
const ColorSlider: React.FC<PropsType> = ({
  className = '',
  style,
  value,
  min = 0,
  max = 100,
  onChange,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<number>(min);

  const updatePoint = (element: HTMLDivElement, event: React.PointerEvent) => {
    const rect = element.getBoundingClientRect();

    let pct = (event.clientX - rect.left) / rect.width;
    const newValue = Math.round(Math.max(min, Math.min(max, (max - min) * pct + min)));

    pct = (newValue ?? min) / (max - min + 1)
    setPosition(rect.width * pct - 3);

    if (onChange) {
      onChange(newValue)
    }
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element) {
      element.setPointerCapture(event.pointerId);

      updatePoint(element, event);
    }
  }

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element && element.hasPointerCapture(event.pointerId)) {
      updatePoint(element, event);
    }
  }

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = ref.current;

    if (element) {
      element.releasePointerCapture(event.pointerId);

      updatePoint(element, event);
    }
  }

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      const pct = (value ?? min) / (max - min + 1)

      setPosition(rect.width * pct - 3);
    }
  }, [max, min, value])

  return (
    <div
      ref={ref}
      className={`${styles.colorSlider} ${className}`}
      style={style}
      onPointerDownCapture={handlePointerDown}
      onPointerMoveCapture={handlePointerMove}
      onPointerUpCapture={handlePointerUp}
    >
      <div style={{ left: `${position}px` }} />
    </div>
  )
}

export default ColorSlider;
