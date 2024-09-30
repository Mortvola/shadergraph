import React from 'react';
import NumberInput from '../NumberInput';
import PSValueTypeSelector from './PSValueTypeSelector';
import { PSValueType } from '../../Renderer/ParticleSystem/Types';
import type PSValue3D from '../../Renderer/Properties/PSValue3D';
import { observer } from 'mobx-react-lite';
import CurveEditor from '../../Color/CurveEditor';
import Checkbox from '../../ShaderEditor/Controls/Checkbox';
import RangeInput from './RangeInput';

type PropsType = {
  value: PSValue3D,
}

const PSValue3DInput: React.FC<PropsType> = observer(({
  value,
}) => {
  const handleXChange = (min: number) => {
    value.values[0].value = { value: [min, value.values[0].value[1]], override: true }
  }

  const handleYChange = (min: number) => {
    value.values[1].value = { value: [min, value.values[1].value[1]], override: true }
  }

  const handleZChange = (min: number) => {
    value.values[2].value = { value: [min, value.values[2].value[1]], override: true }
  }

  const handleTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    value.style = { value: event.target.value as PSValueType, override: true }
  }

  const handleRangeChange = (range: [number, number]) => {
    value.values[0].curveRange = { value: range, override: true };
  }

  const handleAxesChange = (separateAxes: boolean) => {
    value.separateAxes = { value: separateAxes, override: true }
  }

  return (
    <>
      <Checkbox value={value.separateAxes} label="Separate Axes" onChange={handleAxesChange} />
      {
        (
          () => {
            switch (value.style) {
              case PSValueType.Constant:
                return (
                  <>
                    <NumberInput
                      value={value.values[0].value[0]}
                      onChange={handleXChange}
                    />
                    {
                      value.separateAxes
                        ? (
                          <>
                            <NumberInput
                              value={value.values[1].value[0]}
                              onChange={handleYChange}
                            />
                            <NumberInput
                              value={value.values[2].value[0]}
                              onChange={handleZChange}
                            />
                          </>
                        )
                        : null
                    }
                  </>        
                )

              case PSValueType.Random:
                return (
                  <>
                    <RangeInput value={value.values[0]} />
                    {
                      value.separateAxes
                        ? (
                          <>
                            <RangeInput value={value.values[1]} />
                            <RangeInput value={value.values[2]} />
                          </>    
                        )
                        : null
                    }
                  </>
                )

              case PSValueType.Curve:
                return (
                  <CurveEditor value={value.values[0].curve[0]} range={value.values[0].curveRange} onRangeChange={handleRangeChange} />
                )
            }

            return null;
          }
        )()
      }
      <PSValueTypeSelector value={value.style} onChange={handleTypeChange} />
    </>
  )
})

export default PSValue3DInput;