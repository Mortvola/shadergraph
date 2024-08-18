import React from 'react';
import { createPortal } from 'react-dom';
import styles from './ColorPicker.module.scss';
import GradientKeys from './GradientKeys';
import { AlphaGradientKey, ColorGradientKey, Gradient } from '../Renderer/types';
import ColorPicker from './ColorPicker';

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
  const [colorGradient, setColorGradient] = React.useState<string>('')

  const updateRgbGradients = React.useCallback(() => {
    let gradient = '';
    let comma = '';

    for (let i = 0; i < value.colorKeys.length; i += 1) {
      gradient += `${comma}rgb(${value.colorKeys[i].value.map((c) => Math.round(c * 255)).join()}) ${value.colorKeys[i].position * 100}%`
      comma = ', '
    }

    setColorGradient(gradient)
  }, [value.colorKeys])

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setWrapperBounds(rect);

      updateRgbGradients()
    }
  }, [updateRgbGradients])

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

  const handleAddAlphaKey = (position: number) => {
    // Find first key that is greater than this position
    const index = value.alphaKeys.findIndex((k) => k.position > position);

    if (index !== -1) {
      if (index > 0) {
        const newKey: AlphaGradientKey = {
          id: value.alphaKeys.reduce((prev, k) => (Math.max(prev, k.id)), 0) + 1,
          position,
          value: value.alphaKeys[0].value,
        };

        setAlpha(Math.round(newKey.value * 255))
        setSelectedAlphaId(newKey.id);
        setSelectedColorId(undefined)
  
        onChange({
          ...value,
          alphaKeys: [
            ...value.alphaKeys.slice(0, index),
            newKey,
            ...value.alphaKeys.slice(index),
          ],
        });
      }
    }
  }

  const handleAddColorKey = (position: number) => {
    // Find first key that is greater than this position
    const index = value.colorKeys.findIndex((k) => k.position > position);

    if (index !== -1) {
      if (index > 0) {
        const newKey: ColorGradientKey = {
          id: value.colorKeys.reduce((prev, k) => (Math.max(prev, k.id)), 0) + 1,
          position,
          value: value.colorKeys[0].value.slice(), // Copy the previous key value
        };

        setColor(newKey.value)
        setSelectedColorId(newKey.id);
        setSelectedAlphaId(undefined)
  
        onChange({
          ...value,
          colorKeys: [
            ...value.colorKeys.slice(0, index),
            newKey,
            ...value.colorKeys.slice(index),
          ],
        });
      }
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

  const handleColorChange = (color: number[]) => {
    if (selectedColorId !== undefined) {
      setColor(color)

      const index = value.colorKeys.findIndex((k) => k.id === selectedColorId);

      if (index !== -1) {
        onChange({
          ...value,
          colorKeys: [
            ...value.colorKeys.slice(0, index),
            {
              ...value.colorKeys[index],
              value: color,
            },
            ...value.colorKeys.slice(index + 1),
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

  const deleteAlphaKey = (id: number) => {
      // Find index of selected alpha key
      const index = value.alphaKeys.findIndex((k) => k.id === id);

      // Don't delete the keys at position 0 and 1.
      if (
        index !== -1
        && index !== 0
        && index !== value.alphaKeys.length - 1
      ) {
        setSelectedAlphaId(undefined);
    
        onChange({
          ...value,
          alphaKeys: [
            ...value.alphaKeys.slice(0, index),
            ...value.alphaKeys.slice(index + 1),
          ],
        });
      }
  }

  const deleteColorKey = (id: number) => {
    // Find index of selected alpha key
    const index = value.colorKeys.findIndex((k) => k.id === id);

    // Don't delete the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== value.colorKeys.length - 1
    ) {
      setSelectedColorId(undefined);
  
      onChange({
        ...value,
        colorKeys: [
          ...value.colorKeys.slice(0, index),
          ...value.colorKeys.slice(index + 1),
        ],
      });
    }
  }

  const handleMoveAlphaKey = (id: number, position: number) => {
    // Find index of selected alpha key
    const index = value.alphaKeys.findIndex((k) => k.id === id);

    // Don't move the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== value.alphaKeys.length - 1
    ) {
      onChange({
        ...value,
        alphaKeys: [
          ...value.alphaKeys.slice(0, index),
          {
            ...value.alphaKeys[index],
            position,
          },
          ...value.alphaKeys.slice(index + 1),
        ],
      });
    }
  }

  const handleMoveColorKey = (id: number, position: number) => {
    // Find index of selected alpha key
    const index = value.colorKeys.findIndex((k) => k.id === id);

    // Don't move the keys at position 0 and 1.
    if (
      index !== -1
      && index !== 0
      && index !== value.colorKeys.length - 1
    ) {
      onChange({
        ...value,
        colorKeys: [
          ...value.colorKeys.slice(0, index),
          {
            ...value.colorKeys[index],
            position,
          },
          ...value.colorKeys.slice(index + 1),
        ],
      });
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    console.log(event.code)
    event.stopPropagation();
    if (event.code === 'Backspace' || event.code === 'Delete') {
      if (selectedAlphaId !== undefined) {
        deleteAlphaKey(selectedAlphaId)
      }
      else if (selectedColorId !== undefined) {
        deleteColorKey(selectedColorId)
      }
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
                style={{ left: rect.left, bottom: wrapperBounds!.bottom - rect.top }}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
              >
                <GradientKeys
                  keys={value.alphaKeys}
                  onKeyClick={handleAlphaKeyClick}
                  onAddKey={handleAddAlphaKey}
                  onMove={handleMoveAlphaKey}
                  selected={selectedAlphaId}
                />
                <div
                  className={styles.gradientGraph}
                  style={{ background: `linear-gradient(90deg, ${colorGradient})`}}
                />
                <GradientKeys
                  keys={value.colorKeys}
                  onKeyClick={handleColorKeyClick}
                  onAddKey={handleAddColorKey}
                  onMove={handleMoveColorKey}
                  selected={selectedColorId}
                />
                <div className={styles.gradientControls}>
                  {
                    selectedAlphaId !== undefined
                      ? <input type="range" min={0} max={255} value={alpha} onChange={handleAlphaChange} />
                      : null
                  }
                  {
                    selectedColorId !== undefined
                      ? <ColorPicker value={color} onChange={handleColorChange} />
                      : null
                  }
                </div>
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
