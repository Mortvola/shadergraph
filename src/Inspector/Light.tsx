import React from 'react';
import ColorPicker from '../Color/ColorPicker';
import NumberInput from './NumberInput';
import type { MenuItemLike } from '../ContextMenu/types';
import ContextMenu from '../ContextMenu/ContextMenu';
import type { LightPropsInterface } from '../Renderer/Types';
import { runInAction } from 'mobx';

type PropsType = {
  lightProps: LightPropsInterface,
}

const LightComponent: React.FC<PropsType> = ({
  lightProps,
}) => {
  const handleColorChange = (value: number[]) => {
    runInAction(() => {
      lightProps.color = [...value];
      lightProps.handleChange();  
    })
  }

  const handleConstantChange = (value: number) => {
    runInAction(() => {
      lightProps.constant = value;
      lightProps.handleChange();  
    })
  }

  const handleLinearChange = (value: number) => {
    runInAction(() => {
      lightProps.linear = value;
      lightProps.handleChange();  
    })
  }

  const handleQuadraticChange = (value: number) => {
    runInAction(() => {
      lightProps.quadratic = value;
      lightProps.handleChange();  
    })
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
    runInAction(() => {
      lightProps.constant = attenuationPresets[index][1];
      lightProps.linear = attenuationPresets[index][2];
      lightProps.quadratic = attenuationPresets[index][3];
  
      lightProps.handleChange();  
    })
  }, [lightProps])

  const menuItems = React.useCallback((): MenuItemLike[] => ([
    ...attenuationPresets.map((l, index) => ({ name: l[0].toString(), action: () => {setPreset(index)} }))
  ]), [setPreset]);
  
  return (
    <div>
      <label>
        Color:
        <div>
          <ColorPicker value={lightProps.color} onChange={handleColorChange} />
        </div>
      </label>
      Attenuation:
      <div>
        <label>
          Constant:
          <NumberInput value={lightProps.constant} onChange={handleConstantChange} />
        </label>
        <label>
          Linear:
          <NumberInput value={lightProps.linear} onChange={handleLinearChange} />
        </label>
        <label>
          Quadratic:
          <NumberInput value={lightProps.quadratic} onChange={handleQuadraticChange} />
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
