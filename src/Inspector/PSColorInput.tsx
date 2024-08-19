import React from 'react';
import ColorPicker from '../Color/ColorPicker';
import { PSColorType } from '../Renderer/types';
import PSColorTypeSelector from './PSColorTypeSelector';
import GradientEditor from '../Color/GradientEditor';
import PSColor from './PSColor';
import Gradient from './Gradient';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

type PropsType = {
  value: PSColor,
  onChange: (value: PSColor) => void,
}

const PSColorInput: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => {
  const handleMinChange = (color: number[]) => {
    runInAction(() => {
      value.color = [
        color,
        value.color[1],
      ]  
    })

    // onChange({
    //   ...value,
    //   color: [
    //     color,
    //     value.color[1].slice(),
    //   ]
    // })
  }

  const handleMaxChange = (color: number[]) => {
    runInAction(() => {
      value.color = [
        value.color[0],
        color,
      ]  
    })

    // onChange({
    //   ...value,
    //   color: [
    //     value.color[0].slice(),
    //     color,
    //   ]
    // })
  }

  const handleGradient1Change = (gradient: Gradient) => {
    // value.gradients = [gradient, value.gradients[1]]
    // onChange({
    //   ...value,
    //   gradients: [gradient, value.gradients[1]],
    // })
  }

  const handleGradient2Change = (gradient: Gradient) => {
    // value.gradients = [value.gradients[0], gradient];
    // onChange({
    //   ...value,
    //   gradients: [value.gradients[0], gradient],
    // })
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    runInAction(() => {
      value.type = event.target.value as PSColorType;
    })
    // onChange({
    //   ...value,
    //   type: event.target.value as PSColorType,
    // })
  }

  return (
    <>
      {
        (() => {
          switch (value.type) {
            case PSColorType.Constant:
            case PSColorType.Random:
              return (
                <>
                  <ColorPicker value={value.color[0]} onChange={handleMinChange} useAlpha useHdr />
                  {
                    value.type === PSColorType.Random
                      ? <ColorPicker value={value.color[1]} onChange={handleMaxChange} useAlpha useHdr />
                      : null
                  }
                </>
              )

            case PSColorType.Gradient:
            case PSColorType.RandomeGradient:
              return (
                <>
                  <GradientEditor value={value.gradients[0]} onChange={handleGradient1Change} />
                  {
                    value.type === PSColorType.RandomeGradient
                      ? <GradientEditor value={value.gradients[1]} onChange={handleGradient2Change} />
                      : null
                  }
                </>
              )
          }
        })()
      }
      <PSColorTypeSelector value={value.type} onChange={handleTypeChange} />
    </>
  )
})

export default PSColorInput;
