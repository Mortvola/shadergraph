import React from 'react';
import NumberInput from './NumberInput';
import type TransformProps from '../Renderer/Properties/TransformProps';
import styles from './Inspector.module.scss'
import Property from './Property';
import { observer } from 'mobx-react-lite';
import { degToRad, radToDeg } from '../Renderer/Math';
import { vec3n } from 'wgpu-matrix';
import type SceneNode from '../Scene/Types/SceneNode';
import { ComponentType } from '../Renderer/Types';

type PropsType = {
  transformProps: TransformProps,
  node: SceneNode,
}

const Transform: React.FC<PropsType> = observer(({
  transformProps,
  node,
}) => {
  const handleTranslateXChange = (x: number) => {
    transformProps.translate.set(vec3n.create(
      x,
      transformProps.translate.get()[1],
      transformProps.translate.get()[2],
    ), !node.isTopLevel)
  }

  const handleTranslateYChange = (y: number) => {
    transformProps.translate.set(vec3n.create(
      transformProps.translate.get()[0],
      y,
      transformProps.translate.get()[2],
    ), !node.isTopLevel)
  }

  const handleTranslateZChange = (z: number) => {
    transformProps.translate.set(vec3n.create(
      transformProps.translate.get()[0],
      transformProps.translate.get()[1],
      z,
    ), !node.isTopLevel)
  }

  const handleRotateXChange = (x: number) => {
    transformProps.rotate.set(vec3n.create(
      degToRad(x),
      transformProps.rotate.get()[1],
      transformProps.rotate.get()[2],
    ), !node.isTopLevel)
  }

  const handleRotateYChange = (y: number) => {
    transformProps.rotate.set(vec3n.create(
      transformProps.rotate.get()[0],
      degToRad(y),
      transformProps.rotate.get()[2],
    ), !node.isTopLevel)
  }

  const handleRotateZChange = (z: number) => {
    transformProps.rotate.set(vec3n.create(
      transformProps.rotate.get()[0],
      transformProps.rotate.get()[1],
      degToRad(z),
    ), !node.isTopLevel)
  }

  const handleScaleXChange = (x: number) => {
    transformProps.scale.set(vec3n.create(
      x,
      transformProps.scale.get()[1],
      transformProps.scale.get()[2],
    ), !node.isTopLevel)
  }

  const handleScaleYChange = (y: number) => {
    transformProps.scale.set(vec3n.create(
      transformProps.scale.get()[0],
      y,
      transformProps.scale.get()[2],
    ), !node.isTopLevel)
  }

  const handleScaleZChange = (z: number) => {
    transformProps.scale.set(vec3n.create(
      transformProps.scale.get()[0],
      transformProps.scale.get()[1],
      z,
    ), !node.isTopLevel)
  }

  return (
    <>
      <Property
        className={styles.transform}
        label="Translate"
        property={transformProps.translate}
        node={node}
        componentType={ComponentType.Transform}
        propertyPath="translate"
      >
        <NumberInput value={transformProps.translate.get()[0]} onChange={handleTranslateXChange} />
        <NumberInput value={transformProps.translate.get()[1]} onChange={handleTranslateYChange} />
        <NumberInput value={transformProps.translate.get()[2]} onChange={handleTranslateZChange} />
      </Property>

      <Property
        className={styles.transform}
        label="Rotate"
        property={transformProps.rotate}
        node={node}
        componentType={ComponentType.Transform}
        propertyPath="rotate"
      >
        <NumberInput value={radToDeg(transformProps.rotate.get()[0])} onChange={handleRotateXChange} />
        <NumberInput value={radToDeg(transformProps.rotate.get()[1])} onChange={handleRotateYChange} />
        <NumberInput value={radToDeg(transformProps.rotate.get()[2])} onChange={handleRotateZChange} />
      </Property>

      <Property
        className={styles.transform}
        label="Scale"
        property={transformProps.scale}
        node={node}
        componentType={ComponentType.Transform}
        propertyPath="scale"
      >
        <NumberInput value={transformProps.scale.get()[0]} onChange={handleScaleXChange} />
        <NumberInput value={transformProps.scale.get()[1]} onChange={handleScaleYChange} />
        <NumberInput value={transformProps.scale.get()[2]} onChange={handleScaleZChange} />
      </Property>
    </>
  )
})

export default Transform;
