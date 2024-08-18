import React from 'react';
import { createPortal } from 'react-dom';
import styles from './ColorPicker.module.scss';
import GradientKeys from './GradientKeys';
import { Gradient } from '../Renderer/types';

type PropsType = {
  value: Gradient,
  onChange: (gradient: Gradient) => void,
  onClose: () => void,
  rect: DOMRect,
}

const GradientEditorPopup: React.FC<PropsType> = ({
  value,
  onChange,
  onClose,
  rect,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [wrapperBounds, setWrapperBounds] = React.useState<DOMRect>();
  const [selectedAlphaId, setSelectedAlphaId] = React.useState<number | undefined>()
  const [alpha, setAlpha] = React.useState<number>(0);
  const [selectedColorId, setSelectedColorId] = React.useState<number | undefined>()
  const [color, setColor] = React.useState<number[]>([1, 1, 1, 1]);

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setWrapperBounds(rect);
    }
  }, [])

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  }

  const handleAlphaKeyClick = (id: number) => {
    const key = value.alphaKeys.find((k) => k.id === id);

    if (key) {
      setAlpha(Math.round(key.value * 255))
      setSelectedAlphaId(id);
      setSelectedColorId(undefined)
    }
  }

  const handleAlphaChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (selectedAlphaId !== undefined) {
      const a = parseInt(event.target.value, 10);
      setAlpha(a)
      
      const index = value.alphaKeys.findIndex((k) => k.id === selectedAlphaId);

      if (index !== -1) {
        onChange({
          ...value,
          alphaKeys: [
            ...value.alphaKeys.slice(0, index),
            {
              ...value.alphaKeys[index],
              value: a / 255.0,
            },
            ...value.alphaKeys.slice(index + 1),
          ],
        });  
      }
    }
  }

  const handleColorKeyClick = (id: number) => {
    const key = value.colorKeys.find((k) => k.id === id);

    if (key) {
      setColor(key.value)
      setSelectedColorId(id);
      setSelectedAlphaId(undefined)
    }
  }

  return (
    createPortal(
      <div
        ref={ref}
        className={styles.wrapper}
        onClick={onClose}
      >
        {
          wrapperBounds
            ? (
              <div
                className={styles.gradientPopup}
                style={{ left: rect.left, bottom: wrapperBounds!.bottom - rect.top }} onClick={handleClick}
              >
                <GradientKeys keys={value.alphaKeys} onKeyClick={handleAlphaKeyClick} selected={selectedAlphaId} />
                <div className={styles.gradientGraph} />
                <GradientKeys keys={value.colorKeys} onKeyClick={handleColorKeyClick} selected={selectedColorId} />
                {
                  selectedAlphaId !== undefined
                    ? <input type="range" min={0} max={255} value={alpha} onChange={handleAlphaChange} />
                    : null
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

export default GradientEditorPopup;
