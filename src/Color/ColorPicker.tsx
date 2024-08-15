import React from 'react';
import styles from './ColorPicker.module.scss'
import ColorPickerPopup from './ColorPickerPopup';
import ColorMutator from './ColorMutator';
import Color from './Color';

type PropsType = {
  value: number[],
  onChange: (value: number[]) => void,
}

const ColorPicker: React.FC<PropsType> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>();
  const ref = React.useRef<HTMLDivElement>(null);
  const [color, setColor] = React.useState<number[]>([0, 0, 0, 1])
  const [hdr, setHdr] = React.useState<number[]>([0, 0, 0, 1])

  React.useEffect(() => {
    const cm = new ColorMutator(new Color(value[0], value[1] / 255, value[2], value[3] / 255))

    console.log(JSON.stringify(cm.color))

    setColor(cm.color)
    setHdr(cm.colorHdr)
  }, [value])

  const handleClose = () => {
    setOpen(null);
  }

  const handleOpenClick = () => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      console.log(rect);

      setOpen(rect);
    }
  }

  return (
    <div className={styles.color}>
      <div
        ref={ref}
        className={styles.sample}
        // style={{ backgroundColor: `color(srgb-linear ${color[0] * 100}% ${color[1] * 100}% ${color[2] * 100}% / 100%)` }}
        style={{ backgroundColor: `color(srgb-linear ${hdr[0]} ${hdr[1]} ${hdr[2]})` }}
        // style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
        onClick={handleOpenClick}
      />
      {
        open
          ? <ColorPickerPopup value={value} onChange={onChange} onClose={handleClose} rect={open} useHdr={true} />
          : null
      }
    </div>
  )
}

export default ColorPicker;
