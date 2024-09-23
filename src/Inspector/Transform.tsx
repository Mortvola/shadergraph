import React from 'react';
import NumberInput from './NumberInput';
import type TransformProps from '../Renderer/Properties/TransformProps';
import styles from './Inspector.module.scss'
import Property from './Property';
import { observer } from 'mobx-react-lite';
import { degToRad, radToDeg } from '../Renderer/Math';

type PropsType = {
  transformProps: TransformProps,
}

const Transform: React.FC<PropsType> = observer(({
  transformProps,
}) => {
  const handleTranslateXChange = (x: number) => {
    transformProps.translate.set([
      x,
      transformProps.translate.get()[1],
      transformProps.translate.get()[2],
    ], true)
  }

  const handleTranslateYChange = (y: number) => {
    transformProps.translate.set([
      transformProps.translate.get()[0],
      y,
      transformProps.translate.get()[2],
    ], true)
  }

  const handleTranslateZChange = (z: number) => {
    transformProps.translate.set([
      transformProps.translate.get()[0],
      transformProps.translate.get()[1],
      z,
    ], true)
  }

  const handleRotateXChange = (x: number) => {
    transformProps.rotate.set([
      degToRad(x),
      transformProps.rotate.get()[1],
      transformProps.rotate.get()[2],
    ], true)
  }

  const handleRotateYChange = (y: number) => {
    transformProps.rotate.set([
      transformProps.rotate.get()[0],
      degToRad(y),
      transformProps.rotate.get()[2],
    ], true)
  }

  const handleRotateZChange = (z: number) => {
    transformProps.rotate.set([
      transformProps.rotate.get()[0],
      transformProps.rotate.get()[1],
      degToRad(z),
    ], true)
  }

  const handleScaleXChange = (x: number) => {
    transformProps.scale.set([
      x,
      transformProps.scale.get()[1],
      transformProps.scale.get()[2],
    ], true)
  }

  const handleScaleYChange = (y: number) => {
    transformProps.scale.set([
      transformProps.scale.get()[0],
      y,
      transformProps.scale.get()[2],
    ], true)
  }

  const handleScaleZChange = (z: number) => {
    transformProps.scale.set([
      transformProps.scale.get()[0],
      transformProps.scale.get()[1],
      z,
    ], true)
  }

  return (
    <>
      <Property className={styles.transform} label="Translate" property={transformProps.translate}>
        <NumberInput value={transformProps.translate.get()[0]} onChange={handleTranslateXChange} />
        <NumberInput value={transformProps.translate.get()[1]} onChange={handleTranslateYChange} />
        <NumberInput value={transformProps.translate.get()[2]} onChange={handleTranslateZChange} />
      </Property>

      <Property className={styles.transform} label="Rotate" property={transformProps.rotate}>
        <NumberInput value={radToDeg(transformProps.rotate.get()[0])} onChange={handleRotateXChange} />
        <NumberInput value={radToDeg(transformProps.rotate.get()[1])} onChange={handleRotateYChange} />
        <NumberInput value={radToDeg(transformProps.rotate.get()[2])} onChange={handleRotateZChange} />
      </Property>

      <Property className={styles.transform} label="Scale" property={transformProps.scale}>
        <NumberInput value={transformProps.scale.get()[0]} onChange={handleScaleXChange} />
        <NumberInput value={transformProps.scale.get()[1]} onChange={handleScaleYChange} />
        <NumberInput value={transformProps.scale.get()[2]} onChange={handleScaleZChange} />
      </Property>
    </>
  )
})

export default Transform;
