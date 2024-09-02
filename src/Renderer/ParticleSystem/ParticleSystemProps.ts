import { PSNumber } from "../Properties/Property2";
import { PropertyType, removeUndefinedKeys } from "../Properties/Types";
import Collision from "./Collision";
import LifetimeColor from "./LifetimeColor";
import LifetimeSize from "./LIfetimeSize";
import LifetimeVelocity from "./LifetimeVelocity";
import PSColor from "../Properties/PSColor";
import PSValue from "../Properties/PSValue";
import Renderer from "./Renderer";
import Shape from "./Shapes/Shape";
import {
  ParticleSystemPropsDescriptor, ParticleSystemPropsInterface,
  PSValueType, RenderMode, ShapeType,
} from "./Types";

class ParticleSystemProps implements ParticleSystemPropsInterface {
  duration: PSNumber;

  maxPoints: PSNumber
  
  rate: PSNumber

  shape: Shape;

  lifetime: PSValue;

  startSpeed: PSValue;

  startSize: PSValue;

  startColor: PSColor;

  lifetimeColor: LifetimeColor;

  lifetimeSize: LifetimeSize;

  lifetimeVelocity: LifetimeVelocity;

  gravityModifier: PSValue;

  collision: Collision;

  renderer: Renderer;

  private constructor(renderer: Renderer, descriptor?: ParticleSystemPropsDescriptor) {
    this.duration = new PSNumber(descriptor?.duration ?? 5, this.handleChange);
    this.rate = new PSNumber(descriptor?.rate ?? 2, this.handleChange);
    this.maxPoints = new PSNumber(descriptor?.maxPoints ?? 50, this.handleChange);
    this.lifetime = PSValue.fromDescriptor(descriptor?.lifetime ?? { type: PSValueType.Constant, value: [5, 5] }, this.handleChange);
    this.shape = Shape.fromDescriptor(descriptor?.shape ?? { enabled: true, type: ShapeType.Cone, }, this.handleChange);
    this.startSpeed = PSValue.fromDescriptor(descriptor?.startVelocity, this.handleChange);
    this.startSize = PSValue.fromDescriptor(descriptor?.startSize, this.handleChange);
    this.startColor = PSColor.fromDescriptor(descriptor?.startColor, this.handleChange);
    this.lifetimeSize = LifetimeSize.fromDescriptor(descriptor?.lifetimeSize, this.handleChange);
    this.lifetimeVelocity = LifetimeVelocity.fromDescriptor(descriptor?.lifetimeVelocity, this.handleChange);
    this.lifetimeColor = LifetimeColor.fromDescriptor(descriptor?.lifetimeColor, this.handleChange);
    this.gravityModifier = PSValue.fromDescriptor(
      descriptor?.gravityModifier ?? {
        type: PSValueType.Constant,
        value: [0, 0],
      },
      this.handleChange);
    this.collision = Collision.fromDescriptor(descriptor?.collision, this.handleChange);
    this.renderer = renderer;
    renderer.onChange = this.handleChange
  }

  static async create(descriptor?: ParticleSystemPropsDescriptor) {
    const renderer = await Renderer.fromDescriptor(
      descriptor?.renderer ?? { enabled: true, mode: RenderMode.Billboard },
    );

    return new ParticleSystemProps(renderer, descriptor)
  }

  // Copies values from the other props except for
  // properties that are makred as overrides
  copyValues(other: ParticleSystemProps, noOverrides = true) {
    this.duration.copyValues(other.duration, noOverrides);
    this.maxPoints.copyValues(other.maxPoints, noOverrides);
    this.rate.copyValues(other.rate, noOverrides);
    this.lifetime.copyValues(other.lifetime, noOverrides)
    this.shape.copyValues(other.shape, noOverrides);
    this.startSpeed.copyValues(other.startSpeed, noOverrides);
    this.startSize.copyValues(other.startSize, noOverrides);
    this.startColor.copyValues(other.startColor, noOverrides);
    this.lifetimeSize.copyValues(other.lifetimeSize, noOverrides);
    this.lifetimeVelocity.copyValues(other.lifetimeVelocity, noOverrides);
    this.lifetimeColor.copyValues(other.lifetimeColor, noOverrides);
    this.gravityModifier.copyValues(other.gravityModifier, noOverrides);
    this.collision.copyValues(other.collision, noOverrides);
    this.renderer.copyValues(other.renderer, noOverrides);
  }

  hasOverrides(): boolean {
    return (
      this.duration.override
      || this.maxPoints.override
      || this.rate.override
      || this.lifetime.override
      || this.shape.hasOverrides()
      || this.startSpeed.override
      || this.startSize.override
      || this.startColor.override
      || this.lifetimeSize.hasOverrides()
      || this.lifetimeVelocity.hasOverrides()
      || this.lifetimeColor.hasOverrides()
      || this.gravityModifier.override
      || this.collision.hasOverrides()
      || this.renderer.hasOverrides()
    )
  }
  
  async applyOverrides(overrides?: ParticleSystemPropsDescriptor) {
    if (overrides) {
      this.duration.set(overrides?.duration, true);
      this.maxPoints.set(overrides?.maxPoints, true);
      this.rate.set(overrides?.rate, true);
      this.lifetime.applyOverrides(overrides?.lifetime);
      this.shape.applyOverrides(overrides?.shape);
      this.startSpeed.applyOverrides(overrides?.startVelocity);
      this.startSize.applyOverrides(overrides?.startSize);
      this.startColor.applyOverrides(overrides?.startColor);
      this.lifetimeSize.applyOverrides(overrides?.lifetimeSize);
      this.lifetimeVelocity.applyOverrides(overrides?.lifetimeVelocity);
      this.lifetimeColor.applyOverrides(overrides?.lifetimeColor);
      this.gravityModifier.applyOverrides(overrides?.gravityModifier);
      this.collision.applyOverrides(overrides?.collision);
      await this.renderer.applyOverrides(overrides?.renderer);  
    }
  }

  onChange?: () => void;

  handleChange = () => {
    if (this.onChange) {
      console.log('handle change')
        this.onChange();
    }
  }

  toDescriptor(overridesOnly = false): ParticleSystemPropsDescriptor | undefined {
    const descriptor = {
      duration: this.duration.toDescriptor(overridesOnly),
      maxPoints: this.maxPoints.toDescriptor(overridesOnly),
      rate: this.rate.toDescriptor(overridesOnly),
      shape: this.shape.toDescriptor(overridesOnly),
      lifetime: this.lifetime.toDescriptor(overridesOnly),
      startVelocity: this.startSpeed.toDescriptor(overridesOnly),
      startSize: this.startSize.toDescriptor(overridesOnly),
      startColor: this.startColor.toDescriptor(overridesOnly),
      gravityModifier: this.gravityModifier.toDescriptor(overridesOnly),
      lifetimeSize: this.lifetimeSize.toDescriptor(overridesOnly),
      lifetimeVelocity: this.lifetimeVelocity.toDescriptor(overridesOnly),
      lifetimeColor: this.lifetimeColor.toDescriptor(overridesOnly),
      collision: this.collision.toDescriptor(overridesOnly),
      renderer: this.renderer.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default ParticleSystemProps;
