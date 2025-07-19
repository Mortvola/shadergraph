import React from 'react'
import { ComponentType, type SceneObjectComponent } from '../Renderer/Types'
import Transform from './Transform'
import ParticleSystem from './ParticleSystem/ParticleSystem'
import LightComponent from './Light'
import type TransformProps from '../Renderer/Properties/TransformProps'
import type ParticleSystemProps from '../Renderer/ParticleSystem/ParticleSystemProps'
import type LightProps from '../Renderer/Properties/LightProps'
import type SceneNode from '../Scene/Types/SceneNode'

type PropsType = {
  componentType: ComponentType,
  component: SceneObjectComponent
  className?: string
  style?: React.CSSProperties
  node: SceneNode,
}

const Component: React.FC<PropsType> = ({
  componentType,
  component,
  className,
  style,
  node,
}) => {
  const renderComponent = () => {
    switch (componentType) {
      case ComponentType.Transform:
        return <Transform transformProps={(component as TransformProps)} node={node} />

      // case ComponentType.Mesh:
      //   return <ModelTree modelItem={item.item as ModelItem} onChange={handleModelChange} />

      case ComponentType.ParticleSystem:
        return <ParticleSystem particleSystemProps={(component as ParticleSystemProps)} node={node} />

      // case ComponentType.Decal:
      //   return <Decal decalItem={item.item as DecalItem} onChange={handleDecalChange} />

      case ComponentType.Light:
        return <LightComponent lightProps={component as LightProps} />
    }

    return null;
  }

  return (
    <div className={className} style={style}>
      {
        renderComponent()
      }
    </div>
  )
}

export default Component
