import { PSNumber } from "../Properties/Property";
import PSColor from "../Properties/PSColor";
import PSValue from "../Properties/PSValue";
import Collision from "./Collision";
import LifetimeColor from "./LifetimeColor";
import LifetimeSize from "./LIfetimeSize";
import LifetimeVelocity from "./LifetimeVelocity";
import Renderer from "./Renderer";
import Shape from "./Shapes/Shape";
import { ParticleSystemPropsDescriptor } from "./Types";

export interface ParticleSystemPropsInterface {
  duration: PSNumber;

  maxPoints: PSNumber;

  rate: PSNumber;

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

  handleChange: () => void;

  toDescriptor(): ParticleSystemPropsDescriptor | undefined;
}
