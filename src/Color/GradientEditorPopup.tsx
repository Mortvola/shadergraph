import React from 'react';
import { createPortal } from 'react-dom';
import styles from './ColorPicker.module.scss';
import GradientKeys from './GradientKeys';
import ColorPicker from './ColorPicker';
import NumberInput from '../Inspector/NumberInput';
import { getGradientCss } from './Color';
import { observer } from 'mobx-react-lite';
import Gradient from '../Renderer/ParticleSystem/Gradient';

type PropsType = {
  value: Gradient,
  onClose: () => void,
  rect: DOMRect,
}

const GradientEditorPopup: React.FC<PropsType> = observer(({
  value,
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
  const [position, setPosition] = React.useState<number>(0);

  const updateRgbGradients = React.useCallback(() => {
    const gradients = getGradientCss(value.colorKeys, value.alphaKeys)
    setColorGradient(gradients)
  }, [value.alphaKeys, value.colorKeys])

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
      setPosition(key.position);

      setSelectedAlphaId(id);
      setSelectedColorId(undefined)
    }
  }

  const handleAddAlphaKey = (position: number) => {
    const newKey = value.addAlphaKey(position);

    if (newKey !== undefined) {
      setAlpha(Math.round(newKey.value * 255))
      setSelectedAlphaId(newKey.id);
      setSelectedColorId(undefined)
    }
  }

  const handleAddColorKey = (position: number) => {
    const newKey = value.addColorKey(position);

    if (newKey !== undefined) {
      setColor(newKey.value)
      setSelectedColorId(newKey.id);
      setSelectedAlphaId(undefined)  
    }
  }

  const handleAlphaChange = (a: number) => {
    if (
      selectedAlphaId !== undefined
      && value.alphaChange(selectedAlphaId, a)
    ) {
      setAlpha(a)
    }
  }

  const handleColorChange = (color: number[]) => {
    if (
      selectedColorId !== undefined
      && value.colorChange(selectedColorId, color, true)
    ) {
      setColor(color)
    }
  }

  const handleColorKeyClick = (id: number) => {
    const key = value.colorKeys.find((k) => k.id === id);

    if (key) {
      setColor(key.value)
      setPosition(key.position);

      setSelectedColorId(id);
      setSelectedAlphaId(undefined)
    }
  }

  const deleteAlphaKey = (id: number) => {
    value.deleteAlphaKey(id);
    setSelectedAlphaId(undefined);
  }

  const deleteColorKey = (id: number) => {
    value.deleteColorKey(id);
    setSelectedColorId(undefined);
  }

  const handleMoveAlphaKey = (id: number, position: number) => {
    if (value.moveAlphaKey(id, position)) {
      setPosition(position);
    }
  }

  const handleMoveColorKey = (id: number, position: number) => {
    if (value.moveColorKey(id, position)) {
      setPosition(position);
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
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

  const handlePositionChange = (value: number) => {
    if (selectedAlphaId !== undefined) {
      handleMoveAlphaKey(selectedAlphaId, value)
    }
    else if (selectedColorId !== undefined) {
      handleMoveColorKey(selectedColorId, value)
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
                <div className={`${styles.gradientGraph}  ${styles.checkerboard}`}>
                  <div style={{ background: `linear-gradient(90deg, ${colorGradient})`}} />
                </div>
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
                      ? (
                        <>
                          <label>
                            Position:
                            <NumberInput value={position} onChange={handlePositionChange} />
                          </label>
                          <label>
                            Alpha:
                            < NumberInput value={alpha} onChange={handleAlphaChange} />
                          </label>
                        </>
                      )
                      : null
                  }
                  {
                    selectedColorId !== undefined
                      ? (
                        <>
                          <label>
                            Position:
                            <NumberInput value={position} onChange={handlePositionChange} />
                          </label>
                          <label>
                            Color:
                            <ColorPicker value={color} onChange={handleColorChange} />
                          </label>
                        </>
                      )
                      : null
                  }
                  {
                    selectedAlphaId === undefined && selectedColorId === undefined
                      ? <>Select a key to edit.</>
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
})

export default GradientEditorPopup;
