import React from 'react'
import { ComponentType, type SceneObjectComponent } from '../Renderer/Types'
import Transform from './Transform'
import ParticleSystem from './ParticleSystem/ParticleSystem'
import LightComponent from './Light'
import type TransformProps from '../Renderer/Properties/TransformProps'
import type ParticleSystemProps from '../Renderer/ParticleSystem/ParticleSystemProps'
import type LightProps from '../Renderer/Properties/LightProps'

type PropsType = {
  component: SceneObjectComponent
  className?: string
  style?: React.CSSProperties
}

const Component: React.FC<PropsType> = ({
  component,
  className,
  style,
}) => {
  const renderComponent = () => {
    switch (component.type) {
      case ComponentType.Transform:
        return <Transform transformProps={(component.props as TransformProps)} />

      // case ComponentType.Mesh:
      //   return <ModelTree modelItem={item.item as ModelItem} onChange={handleModelChange} />

      case ComponentType.ParticleSystem:
        return <ParticleSystem particleSystemProps={(component.props as ParticleSystemProps)} />

      // case ComponentType.Decal:
      //   return <Decal decalItem={item.item as DecalItem} onChange={handleDecalChange} />

      case ComponentType.Light:
        return <LightComponent lightProps={component.props as LightProps} />
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
