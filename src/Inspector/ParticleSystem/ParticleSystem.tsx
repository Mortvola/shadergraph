import React from 'react';
import NumberInput from '../NumberInput';
import styles from './Particle.module.scss';
import { observer } from 'mobx-react-lite';
import PSValueInput from './PSValueInput';
import PSColorInput from './PSColorInput';
import ShapeModule from './Shapes/ShapeModule';
import PSModule from './PSModule';
import Collision from './Collision';
import PSRenderer from './PSRenderer';
import type ParticleSystemProps from '../../Renderer/ParticleSystem/ParticleSystemProps';
import Property from '../Property';
import { type SpaceType } from '../../Renderer/ParticleSystem/Types';
import PSSpaceTypeSelector from './PSSpaceTypeSelector';
import PSValue3DInput from './PSValue3DInput';
import Checkbox from '../../ShaderEditor/Controls/Checkbox';
import PSEmissions from './PSEmissions';
import type SceneNode from '../../Scene/Types/SceneNode';
import { ComponentType } from '../../Renderer/Types';

type PropsType = {
  particleSystemProps: ParticleSystemProps,
  node: SceneNode,
}

const ParticleSystem: React.FC<PropsType> = observer(({
  particleSystemProps,
  node,
}) => {
  const handleDurationChange = (value: number) => {
    particleSystemProps.duration.set(value, !node.isTopLevel);
  }

  const handleStartDelayChange = (value: number) => {
    particleSystemProps.startDelay.set(value, !node.isTopLevel);
  }

  const handleLoopChange = (value: boolean) => {
    particleSystemProps.loop.set(value, !node.isTopLevel);
  }

  const handleMaxPointsChange = (value: number) => {
    particleSystemProps.maxPoints.set(value, !node.isTopLevel);
  }

  const handleSpaceChange = (value: SpaceType) => {
    particleSystemProps.space.set(value, !node.isTopLevel);
  }

  return (
    <div className={styles.particle}>
      <Property
        label="Duration"
        property={particleSystemProps.duration}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="duration"
      >
        <NumberInput value={particleSystemProps.duration.get()} onChange={handleDurationChange} />
      </Property>
      <Property
        label="Start Delay"
        property={particleSystemProps.startDelay}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startDelay"
      >
        <NumberInput value={particleSystemProps.startDelay.get()} onChange={handleStartDelayChange} />
      </Property>
      <Checkbox
        label={
          <Property
            label="Loop"
            property={particleSystemProps.loop}
            node={node}
            componentType={ComponentType.ParticleSystem}
            propertyPath="loop"
          />
        }
        value={particleSystemProps.loop.get()}
        onChange={handleLoopChange}
      />
      <Property
        label="Maximum Particles"
        property={particleSystemProps.maxPoints}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="maxPoints"
      >
        <NumberInput value={particleSystemProps.maxPoints.get()} onChange={handleMaxPointsChange} />
      </Property>
      <Property
        label="Lifetime"
        property={particleSystemProps.lifetime}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="lifetime"
      >
        <PSValueInput value={particleSystemProps.lifetime} node={node} />
      </Property>
      <Property
        label="Start Speed"
        property={particleSystemProps.startSpeed}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startSpeed"
      >
        <PSValueInput value={particleSystemProps.startSpeed} node={node} />
      </Property>
      <Property
        label="Start Size"
        property={particleSystemProps.startSize}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startSize"
      >
        <PSValue3DInput value={particleSystemProps.startSize} node={node} />
      </Property>
      <Property
        label="Start Rotation"
        property={particleSystemProps.startRotation}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startRotation"
      >
        <PSValue3DInput value={particleSystemProps.startRotation} node={node} />
      </Property>
      <Property
        label="Start Color"
        property={particleSystemProps.startColor}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startColor"
      >
        <PSColorInput value={particleSystemProps.startColor} node={node} />
      </Property>
      <Property
        label="Space"
        property={particleSystemProps.space}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="space"
      >
        <PSSpaceTypeSelector value={particleSystemProps.space.get()} onChange={handleSpaceChange} />
      </Property>
      <Property
        label="Gravity Modifier"
        property={particleSystemProps.gravityModifier}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="gravityModifier"
      >
        <PSValueInput value={particleSystemProps.gravityModifier} node={node} />
      </Property>
      <PSModule title="Emissions" module={particleSystemProps.emissions} node={node}>
        <PSEmissions emissions={particleSystemProps.emissions} node={node} />
      </PSModule>
      <PSModule title="Shape" module={particleSystemProps.shape} node={node}>
        <ShapeModule shape={particleSystemProps.shape} node={node} />
      </PSModule>
      <PSModule title="Size over lifetime" module={particleSystemProps.lifetimeSize} node={node}>
        <Property
          label="Size"
          property={particleSystemProps.lifetimeSize.size}
          node={node}
          componentType={ComponentType.ParticleSystem}
          propertyPath="lifetimeSize.size"
        >
          <PSValue3DInput value={particleSystemProps.lifetimeSize.size} node={node} />
        </Property>
      </PSModule>
      <PSModule title="Rotation over lifetime" module={particleSystemProps.lifetimeRotation} node={node}>
        <Property
          label="Angular Velocity"
          property={particleSystemProps.lifetimeRotation.angularVelocity}
          node={node}
          componentType={ComponentType.ParticleSystem}
          propertyPath="lifetimeRotation.angularVelocity"
        >
          <PSValue3DInput value={particleSystemProps.lifetimeRotation.angularVelocity} node={node} />
        </Property>
      </PSModule>
      <PSModule title="Color over lifetime" module={particleSystemProps.lifetimeColor} node={node}>
        <Property
          label="Color"
          property={particleSystemProps.lifetimeColor.color}
          node={node}
          componentType={ComponentType.ParticleSystem}
          propertyPath="lifetimeColor.color"
        >
          <PSColorInput value={particleSystemProps.lifetimeColor.color} node={node} />
        </Property>
      </PSModule>
      <PSModule title="Velocity over lifetime" module={particleSystemProps.lifetimeVelocity} node={node}>
        <Property
          label="Speed Modifier"
          property={particleSystemProps.lifetimeVelocity.speedModifier}
          node={node}
          componentType={ComponentType.ParticleSystem}
          propertyPath="lifetimeVelocity.speedModifier"
        >
          <PSValueInput value={particleSystemProps.lifetimeVelocity.speedModifier} node={node} />
        </Property>
      </PSModule>
      <PSModule title="Collsion" module={particleSystemProps.collision} node={node}>
        <Collision value={particleSystemProps.collision} node={node} />
      </PSModule>
      <PSModule title="Renderer" module={particleSystemProps.renderer} node={node}>
        <PSRenderer value={particleSystemProps.renderer} node={node} />
      </PSModule>
    </div>
  )
})

export default ParticleSystem;
