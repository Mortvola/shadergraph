import React from 'react';
import ColorPicker from '../../Color/ColorPicker';
import { PSColorType } from '../../Renderer/ParticleSystem/Types';
import PSColorTypeSelector from './PSColorTypeSelector';
import GradientEditor from '../../Color/GradientEditor';
import type PSColor from '../../Renderer/Properties/PSColor';
import { observer } from 'mobx-react-lite';
import type TreeNode from '../../Scene/Types/TreeNode';

type PropsType = {
  value: PSColor,
  node: TreeNode,
}

const PSColorInput: React.FC<PropsType> = observer(({
  value,
  node,
}) => {
  const handleMinChange = (color: number[]) => {
    value.color = {
      value: [
        color,
        value.color[1],
      ],
      override: !node.isTopLevel,
    }
  }

  const handleMaxChange = (color: number[]) => {
    value.color = {
      value: [
        value.color[0],
        color,
      ],
      override: !node.isTopLevel,
    }
  }

  const handleTypeChange = (newValue: PSColorType) => {
    value.style = { value: newValue, override: !node.isTopLevel }
  }

  return (
    <div style={{ display: 'flex', columnGap: '0.25rem' }}>
      {
        (() => {
          switch (value.style) {
            case PSColorType.Constant:
            case PSColorType.Random:
              return (
                <>
                  <ColorPicker value={value.color[0]} onChange={handleMinChange} useAlpha useHdr />
                  {
                    value.style === PSColorType.Random
                      ? <ColorPicker value={value.color[1]} onChange={handleMaxChange} useAlpha useHdr />
                      : null
                  }
                </>
              )

            case PSColorType.Gradient:
            case PSColorType.RandomGradient:
              return (
                <>
                  <GradientEditor value={value.gradients[0]} />
                  {
                    value.style === PSColorType.RandomGradient
                      ? <GradientEditor value={value.gradients[1]} />
                      : null
                  }
                </>
              )
          }
        })()
      }
      <PSColorTypeSelector value={value.style} onChange={handleTypeChange} />
    </div>
  )
})

export default PSColorInput;
