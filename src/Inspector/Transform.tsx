import React from 'react';
import NumberInput from './NumberInput';
import type TransformProps from '../Renderer/Properties/TransformProps';
import styles from './Inspector.module.scss'
import Property from './Property';
import { observer } from 'mobx-react-lite';

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

  return (
    <Property className={styles.transform} label="Translate" property={transformProps.translate}>
      <NumberInput value={transformProps.translate.get()[0]} onChange={handleTranslateXChange} />
      <NumberInput value={transformProps.translate.get()[1]} onChange={handleTranslateYChange} />
      <NumberInput value={transformProps.translate.get()[2]} onChange={handleTranslateZChange} />
    </Property>
  )
})

export default Transform;
