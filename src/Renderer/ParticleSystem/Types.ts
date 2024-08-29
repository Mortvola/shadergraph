import Collision from "./Collision"
import LifetimeColor from "./LifetimeColor"
import LifetimeSize from "./LIfetimeSize"
import LifetimeVelocity from "./LifetimeVelocity"
import PSColor from "./PSColor"
import PSValue from "./PSValue"
import Renderer from "./Renderer"
import Shape from "./Shapes/Shape"

export enum RenderMode {
  Billboard = 'Billboard',
  FlatBillboard = 'FlatBillboard',
}

export type RendererDescriptor = {
  enabled: boolean,
  mode: RenderMode,
  materialId?: number,
}

export type AlphaGradientKey = {
  id: number,
  position: number,
  value: number,
}

export type ColorGradientKey = {
  id: number,
  position: number,
  value: number[],
}

export type GradientDescriptor = {
  alphaKeys: AlphaGradientKey[],
  colorKeys: ColorGradientKey[]
}

export enum PSValueType {
  Constant = 'Constant',
  Random = 'Random',
  Curve = 'Curve',
  RandomeCurve = 'RandomCurve',
}

export enum PSColorType {
  Constant = 'Constant',
  Random = 'Random',
  Gradient = 'Gradient',
  RandomeGradient = 'RandomGradient',
}

export type PSColorDescriptor = {
  type: PSColorType,
  color: [number[], number[]],
  gradients: [GradientDescriptor, GradientDescriptor],
}

export type PSCurvePoint = {
  id: number,
  x: number,
  y: number,
  leftCtrl: {
    x: number,
    y: number,
  },
  rightCtrl: {
    x: number,
    y: number,
  }
}

export type PSCurveDescriptor = {
  points: PSCurvePoint[],
}

export type PSValueDescriptor = {
  type?: PSValueType,
  value?: [number, number],
  curve?: [PSCurveDescriptor, PSCurveDescriptor],
  curveRange?: [number, number],
}

export const isPSValue = (r: unknown): r is PSValueDescriptor => (
  (r as PSValueDescriptor).type !== undefined
  && (r as PSValueDescriptor).value !== undefined
  && (r as PSValueDescriptor).curve !== undefined
);

export type LifetimeColorDescriptor = {
  enabled: boolean,
  color: PSColorDescriptor,
}

export type LifetimeSizeDescriptor = {
  enabled: boolean,
  size: PSValueDescriptor,
}

export type LifetimeVelocityDescriptor = {
  enabled: boolean,
  speedModifier: PSValueDescriptor,
}

export type CollisionDescriptor = {
  enabled: boolean,
  bounce: number,
  dampen: number,
}

export enum ShapeType {
  Cone = 'Cone',
  Sphere = 'Sphere',
  Hemisphere = 'Hemisphere',
  Box = 'Box'
}

export type ConeDescriptor = {
  angle: number;
  originRadius: number;
}

export type SphereDescriptor = {
  radius?: number;
  hemisphere?: boolean;
}

export type ShapeDescriptor = {
  enabled: boolean,
  type: ShapeType,
  cone?: ConeDescriptor,
  sphere?: SphereDescriptor,
  hemisphere?: SphereDescriptor,
}

export type ParticleSystemPropsDescriptor = {
  duration?: number,
  maxPoints?: number,
  rate?: number,

  lifetime?: PSValueDescriptor,

  shape?: ShapeDescriptor,

  startVelocity?: PSValueDescriptor,

  startSize?: PSValueDescriptor,

  lifetimeSize?: LifetimeSizeDescriptor,

  lifetimeVelocity?: LifetimeVelocityDescriptor,

  startColor?: PSColorDescriptor
  lifetimeColor?: LifetimeColorDescriptor,

  gravityModifier?: PSValueDescriptor,

  collision: CollisionDescriptor,

  renderer: RendererDescriptor,
}

export type ParticleSystemPropsOverrides = Partial<ParticleSystemPropsDescriptor>;

export interface ParticleSystemPropsInterface {
  duration: number;

  maxPoints: number

  rate: number

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

  handleChange: () => void;

  toDescriptor(): ParticleSystemPropsDescriptor;
}
