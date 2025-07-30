import React from 'react';
import NumberInput from '../NumberInput';
import PSValueTypeSelector from './PSValueTypeSelector';
import { PSValueType } from '../../Renderer/ParticleSystem/Types';
import type PSValue3D from '../../Renderer/Properties/PSValue3D';
import { observer } from 'mobx-react-lite';
import CurveEditor from '../../Color/CurveEditor';
import Checkbox from '../../ShaderEditor/Controls/Checkbox';
import RangeInput from './RangeInput';
import type SceneNode from '../../Scene/Types/SceneNode';
import styles from './PSValue3DInput.module.scss';

type PropsType = {
  value: PSValue3D,
  sceneNode: SceneNode,
}

const PSValue3DInput: React.FC<PropsType> = observer(({
  value,
  sceneNode,
}) => {
  const handleXChange = (min: number) => {
    value.values[0].value = { value: [min, value.values[0].value[1]], override: !sceneNode.isTopLevel }
  }

  const handleYChange = (min: number) => {
    value.values[1].value = { value: [min, value.values[1].value[1]], override: !sceneNode.isTopLevel }
  }

  const handleZChange = (min: number) => {
    value.values[2].value = { value: [min, value.values[2].value[1]], override: !sceneNode.isTopLevel }
  }

  const handleTypeChange = (newValue: PSValueType) => {
    value.style = { value: newValue, override: !sceneNode.isTopLevel }
  }

  const handleRangeXChange = (range: [number, number]) => {
    value.values[0].curveRange = { value: range, override: !sceneNode.isTopLevel };
  }

  const handleRangeYChange = (range: [number, number]) => {
    value.values[1].curveRange = { value: range, override: !sceneNode.isTopLevel };
  }

  const handleRangeZChange = (range: [number, number]) => {
    value.values[2].curveRange = { value: range, override: !sceneNode.isTopLevel };
  }

  const handleAxesChange = (separateAxes: boolean) => {
    value.separateAxes = { value: separateAxes, override: !sceneNode.isTopLevel }
  }

  return (
    <div className={`${styles.layout} ${value.separateAxes ? styles.triple : ''}`}>
      <Checkbox value={value.separateAxes} label="3D" onChange={handleAxesChange} />
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
                  <>
                    <CurveEditor
                      value={value.values[0].curve[0]}
                      range={value.values[0].curveRange}
                      onRangeChange={handleRangeXChange}
                    />
                    {
                      value.separateAxes
                        ? (
                          <>
                            <CurveEditor
                              value={value.values[1].curve[0]}
                              range={value.values[1].curveRange}
                              onRangeChange={handleRangeYChange}
                            />
                            <CurveEditor
                              value={value.values[2].curve[0]}
                              range={value.values[2].curveRange}
                              onRangeChange={handleRangeZChange}
                            />
                            </>
                        )
                        : null
                    }
                  </>
                )
            }

            return null;
          }
        )()
      }
      <PSValueTypeSelector value={value.style} onChange={handleTypeChange} />
    </div>
  )
})

export default PSValue3DInput;