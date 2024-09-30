import type { PSNumber, PSSpace } from "../Properties/Property";
import type PSColor from "../Properties/PSColor";
import type PSValue from "../Properties/PSValue";
import type PSValue3D from "../Properties/PSValue3D";
import type Collision from "./Collision";
import type LifetimeColor from "./LifetimeColor";
import type LifetimeSize from "./LIfetimeSize";
import type LifetimeVelocity from "./LifetimeVelocity";
import type Renderer from "./Renderer";
import type Shape from "./Shapes/Shape";
import type { ParticleSystemPropsDescriptor } from "./Types";

export interface ParticleSystemPropsInterface {
  duration: PSNumber;

  maxPoints: PSNumber;

  rate: PSNumber;

  shape: Shape;

  lifetime: PSValue;

  startSpeed: PSValue;

  startSize: PSValue3D;

  startColor: PSColor;

  space: PSSpace;

  lifetimeColor: LifetimeColor;

  lifetimeSize: LifetimeSize;

  lifetimeVelocity: LifetimeVelocity;

  gravityModifier: PSValue;

  collision: Collision;

  renderer: Renderer;

  handleChange: () => void;

  toDescriptor(): ParticleSystemPropsDescriptor | undefined;
}
