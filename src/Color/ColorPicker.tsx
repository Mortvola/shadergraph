import React from 'react';
import styles from './ColorPicker.module.scss'
import ColorPickerPopup from './ColorPickerPopup';
import ColorMutator from './ColorMutator';
import Color from './Color';
import { observer } from 'mobx-react-lite';

type PropsType = {
  value: number[],
  useHdr?: boolean,
  useAlpha?: boolean,
  onChange: (value: number[]) => void,
}

const ColorPicker: React.FC<PropsType> = observer(({
  value,
  useHdr = false,
  useAlpha = false,
  onChange,
}) => {
  const [open, setOpen] = React.useState<DOMRect | null>();
  const ref = React.useRef<HTMLDivElement>(null);
  const [hdr, setHdr] = React.useState<number[]>([0, 0, 0, 1])

  React.useEffect(() => {
    const cm = new ColorMutator(new Color(value[0], value[1], value[2], value[3]))

    setHdr(cm.colorHdr)
  }, [value])

  const handleClose = () => {
    setOpen(null);
  }

  const handleOpenClick = () => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setOpen(rect);
    }
  }

  return (
    <>
      <div
        ref={ref}
        className={styles.sample}
        style={{ backgroundColor: `color(srgb-linear ${hdr[0]} ${hdr[1]} ${hdr[2]})` }}
        onClick={handleOpenClick}
      />
      {
          open
            ? <ColorPickerPopup value={value} onChange={onChange} onClose={handleClose} rect={open} useHdr={useHdr} useAlpha={useAlpha} />
            : null
      }
    </>
  )
})

export default ColorPicker;
