import Collision from "./Collision";
import LifetimeColor from "./LifetimeColor";
import LifetimeSize from "./LIfetimeSize";
import LifetimeVelocity from "./LifetimeVelocity";
import PSColor from "./PSColor";
import PSValue from "./PSValue";
import Renderer from "./Renderer";
import Shape from "./Shapes/Shape";
import {
  ParticleSystemPropsDescriptor, ParticleSystemPropsInterface,
  PSNumber,
  PSValueType, RenderMode, ShapeType,
} from "./Types";

class ParticleSystemProps implements ParticleSystemPropsInterface {
  duration: PSNumber;

  maxPoints: PSNumber
  
  rate: PSNumber

  shape: Shape;

  lifetime: PSValue;

  startVelocity: PSValue;

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
    this.startVelocity = PSValue.fromDescriptor(descriptor?.startVelocity, this.handleChange);
    this.startSize = PSValue.fromDescriptor(descriptor?.startSize, this.handleChange);
    this.lifetimeSize = LifetimeSize.fromDescriptor(descriptor?.lifetimeSize, this.handleChange);
    this.lifetimeVelocity = LifetimeVelocity.fromDescriptor(descriptor?.lifetimeVelocity, this.handleChange);
    this.startColor = PSColor.fromDescriptor(descriptor?.startColor, this.handleChange);
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

  onChange?: () => void;

  handleChange = () => {
    console.log('handle change')
    // if (this.onChange) {
    //   this.onChange();
    // }
  }

  toDescriptor(): ParticleSystemPropsDescriptor {
    return ({
      duration: this.duration.value,
      maxPoints: this.maxPoints.value,
      rate: this.rate.value,
      shape: this.shape.toDescriptor(),
      lifetime: this.lifetime.toDescriptor(),
      startVelocity: this.startVelocity.toDescriptor(),
      startSize: this.startSize.toDescriptor(),
      lifetimeSize: this.lifetimeSize.toDescriptor(),
      startColor: this.startColor.toDescriptor(),
      lifetimeColor: this.lifetimeColor.toDescriptor(),
      gravityModifier: this.gravityModifier.toDescriptor(),
      collision: this.collision.toDescriptor(),
      renderer: this.renderer.toDescriptor(),
    })
  }
}

export default ParticleSystemProps;
