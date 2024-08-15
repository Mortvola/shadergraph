import React from 'react';
import ColorPicker from '../Color/ColorPicker';
import { LightItem } from '../Renderer/types';
import NumberInput from './NumberInput';
import { MenuItemLike } from '../ContextMenu/types';
import ContextMenu from '../ContextMenu/ContextMenu';

type PropsType = {
  light: LightItem,
  onChange: (light: LightItem) => void,
}

const LightComponent: React.FC<PropsType> = ({
  light,
  onChange,
}) => {
  const handleColorChange = (value: number[]) => {
    light.color = [...value];
    
    onChange(light)
  }

  const handleConstantChange = (value: number) => {
    light.constant = value;
    onChange(light)
  }

  const handleLinearChange = (value: number) => {
    light.linear = value;
    onChange(light)
  }

  const handleQuadraticChange = (value: number) => {
    light.quadratic = value;
    onChange(light)
  }

  const [showMenu, setShowMenu] = React.useState<{ x: number, y: number } | null>(null);
  const presetRef = React.useRef<HTMLButtonElement>(null);

  const handlePresetClick = () => {
    if (!showMenu) {
      const element = presetRef.current;

      if (element) {
        const rect = element.getBoundingClientRect();

        setShowMenu({ x: rect.left, y: rect.bottom })
      }
    }
  }

  const handleMenuClose = () => {
    setShowMenu(null);
  }

  const setPreset = React.useCallback((index: number) => {
    light.constant = attenuationPresets[index][1];
    light.linear = attenuationPresets[index][2];
    light.quadratic = attenuationPresets[index][3];

    onChange(light);
  }, [light, onChange])

  const menuItems = React.useCallback((): MenuItemLike[] => ([
    ...attenuationPresets.map((l, index) => ({ name: l[0].toString(), action: () => {setPreset(index)} }))
  ]), [setPreset]);
  
  return (
    <div>
      <label>
        Color:
        <div>
          <ColorPicker value={light.color} onChange={handleColorChange} />
        </div>
      </label>
      Parameters:
      <div>
        <label>
          Constant:
          <NumberInput value={light.constant} onChange={handleConstantChange} />
        </label>
        <label>
          Linear:
          <NumberInput value={light.linear} onChange={handleLinearChange} />
        </label>
        <label>
          Quadratic:
          <NumberInput value={light.quadratic} onChange={handleQuadraticChange} />
        </label>
        <button ref={presetRef} onClick={handlePresetClick}>Presets</button>
      </div>
      {
        showMenu
          ? <ContextMenu menuItems={menuItems} x={showMenu.x} y={showMenu.y} onClose={handleMenuClose} />
          : null
      }
    </div>
  )
}

// From wiki.ogre3d.org
const attenuationPresets: number[][] = [
  [3250, 1.0, 0.0014, 0.000007],
  [600, 1.0, 0.007, 0.0002],
  [325, 1.0, 0.014, 0.0007],
  [200, 1.0, 0.022, 0.0019],
  [160, 1.0, 0.027, 0.0028],
  [100, 1.0, 0.045, 0.0075],
  [65, 1.0, 0.07, 0.017],
  [50, 1.0, 0.09, 0.032],
  [32, 1.0, 0.14, 0.07],
  [20, 1.0, 0.22, 0.20],
  [13, 1.0, 0.35, 0.44],
  [7, 1.0, 0.7, 1.8],
]

export default LightComponent;
