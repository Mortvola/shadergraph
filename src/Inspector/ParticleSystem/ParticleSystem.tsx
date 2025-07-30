import React from 'react';
import NumberInput from '../NumberInput';
import styles from './ParticleSystem.module.scss';
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
  sceneNode: SceneNode,
}

const ParticleSystem: React.FC<PropsType> = observer(({
  particleSystemProps,
  sceneNode,
}) => {
  const handleDurationChange = (value: number) => {
    particleSystemProps.duration.set(value, !sceneNode.isTopLevel);
  }

  const handleStartDelayChange = (value: number) => {
    particleSystemProps.startDelay.set(value, !sceneNode.isTopLevel);
  }

  const handleLoopChange = (value: boolean) => {
    particleSystemProps.loop.set(value, !sceneNode.isTopLevel);
  }

  const handleMaxPointsChange = (value: number) => {
    particleSystemProps.maxPoints.set(value, !sceneNode.isTopLevel);
  }

  const handleSpaceChange = (value: SpaceType) => {
    particleSystemProps.space.set(value, !sceneNode.isTopLevel);
  }

  return (
    <div className={styles.particle}>
      <Property
        label="Duration"
        property={particleSystemProps.duration}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="duration"
      >
        <NumberInput value={particleSystemProps.duration.get()} onChange={handleDurationChange} />
      </Property>
      <Property
        label="Start Delay"
        property={particleSystemProps.startDelay}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startDelay"
      >
        <NumberInput value={particleSystemProps.startDelay.get()} onChange={handleStartDelayChange} />
      </Property>
      <Property
        label="Loop"
        property={particleSystemProps.loop}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="loop"
      >
        <Checkbox
          value={particleSystemProps.loop.get()}
          onChange={handleLoopChange}
        />
      </Property>
      <Property
        label="Maximum Particles"
        property={particleSystemProps.maxPoints}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="maxPoints"
      >
        <NumberInput value={particleSystemProps.maxPoints.get()} onChange={handleMaxPointsChange} />
      </Property>
      <Property
        label="Lifetime"
        property={particleSystemProps.lifetime}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="lifetime"
      >
        <PSValueInput value={particleSystemProps.lifetime} sceneNode={sceneNode} />
      </Property>
      <Property
        label="Start Speed"
        property={particleSystemProps.startSpeed}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startSpeed"
      >
        <PSValueInput value={particleSystemProps.startSpeed} sceneNode={sceneNode} />
      </Property>
      <Property
        label="Start Size"
        property={particleSystemProps.startSize}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startSize"
      >
        <PSValue3DInput value={particleSystemProps.startSize} sceneNode={sceneNode} />
      </Property>
      <Property
        label="Start Rotation"
        property={particleSystemProps.startRotation}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startRotation"
      >
        <PSValue3DInput value={particleSystemProps.startRotation} sceneNode={sceneNode} />
      </Property>
      <Property
        label="Start Color"
        property={particleSystemProps.startColor}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="startColor"
      >
        <PSColorInput value={particleSystemProps.startColor} sceneNode={sceneNode} />
      </Property>
      <Property
        label="Space"
        property={particleSystemProps.space}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="space"
      >
        <PSSpaceTypeSelector value={particleSystemProps.space.get()} onChange={handleSpaceChange} />
      </Property>
      <Property
        label="Gravity Modifier"
        property={particleSystemProps.gravityModifier}
        sceneNode={sceneNode}
        componentType={ComponentType.ParticleSystem}
        propertyPath="gravityModifier"
      >
        <PSValueInput value={particleSystemProps.gravityModifier} sceneNode={sceneNode} />
      </Property>
      <PSModule title="Emissions" module={particleSystemProps.emissions} sceneNode={sceneNode}>
        <PSEmissions emissions={particleSystemProps.emissions} sceneNode={sceneNode} />
      </PSModule>
      <PSModule title="Shape" module={particleSystemProps.shape} sceneNode={sceneNode}>
        <ShapeModule shape={particleSystemProps.shape} sceneNode={sceneNode} />
      </PSModule>
      <PSModule title="Size over lifetime" module={particleSystemProps.lifetimeSize} sceneNode={sceneNode}>
        <Property
          label="Size"
          property={particleSystemProps.lifetimeSize.size}
          sceneNode={sceneNode}
          componentType={ComponentType.ParticleSystem}
          propertyPath="lifetimeSize.size"
        >
          <PSValue3DInput value={particleSystemProps.lifetimeSize.size} sceneNode={sceneNode} />
        </Property>
      </PSModule>
      <PSModule title="Rotation over lifetime" module={particleSystemProps.lifetimeRotation} sceneNode={sceneNode}>
        <Property
          label="Angular Velocity"
          property={particleSystemProps.lifetimeRotation.angularVelocity}
          sceneNode={sceneNode}
          componentType={ComponentType.ParticleSystem}
          propertyPath="lifetimeRotation.angularVelocity"
        >
          <PSValue3DInput value={particleSystemProps.lifetimeRotation.angularVelocity} sceneNode={sceneNode} />
        </Property>
      </PSModule>
      <PSModule title="Color over lifetime" module={particleSystemProps.lifetimeColor} sceneNode={sceneNode}>
        <Property
          label="Color"
          property={particleSystemProps.lifetimeColor.color}
          sceneNode={sceneNode}
          componentType={ComponentType.ParticleSystem}
          propertyPath="lifetimeColor.color"
        >
          <PSColorInput value={particleSystemProps.lifetimeColor.color} sceneNode={sceneNode} />
        </Property>
      </PSModule>
      <PSModule title="Velocity over lifetime" module={particleSystemProps.lifetimeVelocity} sceneNode={sceneNode}>
        <Property
          label="Speed Modifier"
          property={particleSystemProps.lifetimeVelocity.speedModifier}
          sceneNode={sceneNode}
          componentType={ComponentType.ParticleSystem}
          propertyPath="lifetimeVelocity.speedModifier"
        >
          <PSValueInput value={particleSystemProps.lifetimeVelocity.speedModifier} sceneNode={sceneNode} />
        </Property>
      </PSModule>
      <PSModule title="Collsion" module={particleSystemProps.collision} sceneNode={sceneNode}>
        <Collision value={particleSystemProps.collision} sceneNode={sceneNode} />
      </PSModule>
      <PSModule title="Renderer" module={particleSystemProps.renderer} sceneNode={sceneNode}>
        <PSRenderer value={particleSystemProps.renderer} sceneNode={sceneNode} />
      </PSModule>
    </div>
  )
})

export default ParticleSystem;
