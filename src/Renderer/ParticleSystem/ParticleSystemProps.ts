import { PSNumber } from "../Properties/Property";
import { PropsBase, removeUndefinedKeys } from "../Properties/Types";
import Collision from "./Collision";
import LifetimeColor from "./LifetimeColor";
import LifetimeSize from "./LIfetimeSize";
import LifetimeVelocity from "./LifetimeVelocity";
import PSColor from "../Properties/PSColor";
import PSValue from "../Properties/PSValue";
import Renderer from "./Renderer";
import Shape from "./Shapes/Shape";
import type {
  ParticleSystemPropsDescriptor} from "./Types";
import {
  PSValueType, RenderMode, ShapeType,
} from "./Types";
import type { ParticleSystemPropsInterface } from "./ParticleSystemPropsInterface";
import type PropertyBase from "../Properties/PropertyBase";

class ParticleSystemProps extends PropsBase implements ParticleSystemPropsInterface {
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

  constructor(
    descriptor?: ParticleSystemPropsDescriptor,
    previousProps?: ParticleSystemProps,
  ) {
    super();

    this.duration = new PSNumber('Duration', this, descriptor?.duration, 5, this.handleChange, previousProps?.duration);
    this.rate = new PSNumber('Rate', this, descriptor?.rate, 2, this.handleChange, previousProps?.rate);
    this.maxPoints = new PSNumber('Maximum Points', this, descriptor?.maxPoints, 50, this.handleChange, previousProps?.maxPoints);
    this.lifetime = new PSValue('Lifetime', this, descriptor?.lifetime, { type: PSValueType.Constant, value: [5, 5] }, this.handleChange, previousProps?.lifetime);
    this.shape = new Shape(this, descriptor?.shape, { enabled: true, type: ShapeType.Cone, }, this.handleChange, previousProps?.shape);
    this.startSpeed = new PSValue('Start Speed', this, descriptor?.startVelocity, {}, this.handleChange, previousProps?.startSpeed);
    this.startSize = new PSValue('Start Size', this, descriptor?.startSize, {}, this.handleChange, previousProps?.startSize);
    this.startColor = new PSColor('Start Color', this, descriptor?.startColor, this.handleChange, previousProps?.startColor);
    this.lifetimeSize = new LifetimeSize(this, descriptor?.lifetimeSize, this.handleChange, previousProps?.lifetimeSize);
    this.lifetimeVelocity = new LifetimeVelocity(this, descriptor?.lifetimeVelocity, this.handleChange, previousProps?.lifetimeVelocity);
    this.lifetimeColor = new LifetimeColor(this, descriptor?.lifetimeColor, this.handleChange, previousProps?.lifetimeColor);
    this.gravityModifier = new PSValue(
      'Gravity Modifier',
      this, 
      descriptor?.gravityModifier,
      {
        type: PSValueType.Constant,
        value: [0, 0],
      },
      this.handleChange,
      previousProps?.gravityModifier,
    );
    this.collision = new Collision(this, descriptor?.collision, this.handleChange, previousProps?.collision);

    this.renderer = new Renderer(
      this, descriptor?.renderer, { enabled: true, mode: RenderMode.Billboard }, this.handleChange, previousProps?.renderer
    );
 }

  // static async create(descriptor?: ParticleSystemPropsDescriptor, previousProps?: ParticleSystemProps) {
  //   const renderer = await Renderer.create(
  //     descriptor?.renderer, { enabled: true, mode: RenderMode.Billboard }, undefined, previousProps?.renderer
  //   );

  //   return new ParticleSystemProps(renderer, descriptor, previousProps)
  // }

  onChange?: () => void;

  handleChange = () => {
    if (this.onChange) {
      console.log('handle change')
        this.onChange();
    }
  }

  getOverrides(): PropertyBase[] {
    return [
      this.duration.getOverrides(),
      this.maxPoints.getOverrides(),
      this.rate.getOverrides(),
      ...this.shape.getOverrides(),
      this.lifetime.getOverrides(),
      this.startSpeed.getOverrides(),
      this.startSize.getOverrides(),
      this.startColor.getOverrides(),
      this.gravityModifier.getOverrides(),
      ...this.lifetimeSize.getOverrides(),
      ...this.lifetimeVelocity.getOverrides(),
      ...this.lifetimeColor.getOverrides(),
      ...this.collision.getOverrides(),
      ...this.renderer.getOverrides(),
    ]
      .filter((p) => p !== undefined)
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
