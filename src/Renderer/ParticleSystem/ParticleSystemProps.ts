import { PSBoolean, PSNumber, PSSpace } from '../Properties/Property';
import { removeUndefinedKeys } from '../Properties/Types';
import PropsBase from '../Properties/PropsBase';
import Collision from './Collision';
import LifetimeColor from './LifetimeColor';
import LifetimeSize from './LIfetimeSize';
import LifetimeVelocity from './LifetimeVelocity';
import PSColor from '../Properties/PSColor';
import PSValue from '../Properties/PSValue';
import PSValue3D from '../Properties/PSValue3D';
import Renderer from './Renderer';
import Shape from './Shapes/Shape';
import {
  type ParticleSystemPropsDescriptor,
  PSValueType, RenderMode,
  SpaceType,
} from './Types';
import type { ParticleSystemPropsInterface } from './ParticleSystemPropsInterface';
import Emissions from './Emissions';
import LifetimeRotation from './LifetimeRotation';

class ParticleSystemProps extends PropsBase implements ParticleSystemPropsInterface {
  duration: PSNumber;

  startDelay: PSNumber;

  loop: PSBoolean;

  maxPoints: PSNumber

  emissions: Emissions

  shape: Shape;

  lifetime: PSValue;

  startSpeed: PSValue;

  startSize: PSValue3D;

  startRotation: PSValue3D;

  startColor: PSColor;

  space: PSSpace;

  lifetimeColor: LifetimeColor;

  lifetimeSize: LifetimeSize;

  lifetimeRotation: LifetimeRotation;

  lifetimeVelocity: LifetimeVelocity;

  gravityModifier: PSValue;

  collision: Collision;

  renderer: Renderer;

  constructor(
    descriptor?: ParticleSystemPropsDescriptor,
  ) {
    super();

    this.duration = new PSNumber(this, descriptor?.duration, 5, this.handleChange);
    this.startDelay = new PSNumber(
      this, descriptor?.startDelay, 0, this.handleChange,
    );
    this.loop = new PSBoolean(this, descriptor?.loop, true, this.handleChange);

    // Handle retrieving the rate over time from the old location
    // TODO: Remove when no longer needed.
    const emissionsDescriptor = { ...descriptor?.emissions }

    if (emissionsDescriptor.rate === undefined) {
      emissionsDescriptor.rate = descriptor?.rate
    }

    this.emissions = new Emissions(this, emissionsDescriptor, this.handleChange)

    this.maxPoints = new PSNumber(
      this, descriptor?.maxPoints, 50, this.handleChange,
    );

    this.lifetime = new PSValue(
      this,
      descriptor?.lifetime,
      { type: PSValueType.Constant, value: [5, 5] },
      this.handleChange,
    );

    this.shape = new Shape(this, descriptor?.shape, this.handleChange);
    this.startSpeed = new PSValue(
      this, descriptor?.startVelocity, {}, this.handleChange,
    );

    this.startSize = new PSValue3D(
      this, descriptor?.startSize, undefined, this.handleChange,
    );

    this.startRotation = new PSValue3D(
      this, descriptor?.startRotation, undefined, this.handleChange,
    );

    this.startColor = new PSColor(
      this, descriptor?.startColor, this.handleChange,
    );

    this.space = new PSSpace(
      this, descriptor?.space, SpaceType.Local, this.handleChange,
    );

    this.lifetimeSize = new LifetimeSize(
      this, descriptor?.lifetimeSize, this.handleChange,
    );

    this.lifetimeRotation = new LifetimeRotation(
      this, descriptor?.lifetimeRotation, this.handleChange,
    )

    this.lifetimeVelocity = new LifetimeVelocity(
      this, descriptor?.lifetimeVelocity, this.handleChange,
    );

    this.lifetimeColor = new LifetimeColor(
      this, descriptor?.lifetimeColor, this.handleChange,
    );

    this.gravityModifier = new PSValue(
      this,
      descriptor?.gravityModifier,
      {
        type: PSValueType.Constant,
        value: [0, 0],
      },
      this.handleChange,
    );

    this.collision = new Collision(this, descriptor?.collision, this.handleChange);

    this.renderer = new Renderer(
      this,
      descriptor?.renderer,
      { enabled: true, mode: RenderMode.Billboard },
      this.handleChange,
    );
 }

 applyModifications(descriptor: ParticleSystemPropsDescriptor, override: boolean, propertyPath?: string) {
  this.duration.applyModifications(descriptor.duration, override)
  this.startDelay.applyModifications(descriptor.startDelay, override)
  this.loop.applyModifications(descriptor.loop, override)
  this.emissions.update(descriptor.emissions)
  this.maxPoints.applyModifications(descriptor.maxPoints, override)
  this.lifetime.update(descriptor.lifetime)
  this.shape.update(descriptor.shape)
  this.startSpeed.update(descriptor.startVelocity)
  this.startSize.update(descriptor.startSize)
  this.startRotation.update(descriptor.startRotation)
  this.startColor.update(descriptor.startColor)
  this.space.applyModifications(descriptor.space, override)
  this.lifetimeSize.update(descriptor.lifetimeSize)
  this.lifetimeRotation.update(descriptor.lifetimeRotation)
  this.lifetimeVelocity.update(descriptor.lifetimeVelocity)
  this.lifetimeColor.update(descriptor.lifetimeColor)
  this.gravityModifier.update(descriptor.gravityModifier)
  this.collision.update(descriptor.collision)
  this.renderer.update(descriptor.renderer)
 }

  onChange?: () => void;

  handleChange = () => {
    if (this.onChange) {
      this.onChange();
    }
  }

  toDescriptor(overridesOnly: boolean): ParticleSystemPropsDescriptor | undefined {
    const descriptor = {
      duration: this.duration.toDescriptor(overridesOnly),
      startDelay: this.startDelay.toDescriptor(overridesOnly),
      loop: this.loop.toDescriptor(overridesOnly),
      maxPoints: this.maxPoints.toDescriptor(overridesOnly),
      shape: this.shape.toDescriptor(overridesOnly),
      lifetime: this.lifetime.toDescriptor(overridesOnly),
      startVelocity: this.startSpeed.toDescriptor(overridesOnly),
      startSize: this.startSize.toDescriptor(overridesOnly),
      startRotation: this.startRotation.toDescriptor(overridesOnly),
      startColor: this.startColor.toDescriptor(overridesOnly),
      emissions: this.emissions.toDescriptor(overridesOnly),
      space: this.space.toDescriptor(overridesOnly),
      gravityModifier: this.gravityModifier.toDescriptor(overridesOnly),
      lifetimeSize: this.lifetimeSize.toDescriptor(overridesOnly),
      lifetimeRotation: this.lifetimeRotation.toDescriptor(overridesOnly),
      lifetimeVelocity: this.lifetimeVelocity.toDescriptor(overridesOnly),
      lifetimeColor: this.lifetimeColor.toDescriptor(overridesOnly),
      collision: this.collision.toDescriptor(overridesOnly),
      renderer: this.renderer.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default ParticleSystemProps;
