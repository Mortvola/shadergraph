export type PSModuleDescriptor = {
  enabled?: boolean
}

export enum RenderMode {
  Billboard = 'Billboard',
  FlatBillboard = 'FlatBillboard',
}

export type RendererDescriptor = PSModuleDescriptor & {
  mode?: RenderMode,
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

export type LifetimeColorDescriptor = PSModuleDescriptor & {
  color?: PSColorDescriptor,
}

export type LifetimeSizeDescriptor = PSModuleDescriptor & {
  size?: PSValueDescriptor,
}

export type LifetimeVelocityDescriptor = PSModuleDescriptor & {
  speedModifier?: PSValueDescriptor,
}

export type CollisionDescriptor = PSModuleDescriptor & {
  bounce?: number,
  dampen?: number,
}

export enum SpaceType {
  Local = 'Local',
  World = 'World',
}

export enum ShapeType {
  Cone = 'Cone',
  Sphere = 'Sphere',
  Hemisphere = 'Hemisphere',
  Box = 'Box'
}

export type ConeDescriptor = {
  angle?: number;
  originRadius?: number;
}

export type SphereDescriptor = {
  radius?: number;
  hemisphere?: boolean;
}

export type ShapeDescriptor = {
  enabled?: boolean,
  type?: ShapeType,
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

  space?: SpaceType,

  lifetimeSize?: LifetimeSizeDescriptor,

  lifetimeVelocity?: LifetimeVelocityDescriptor,

  startColor?: PSColorDescriptor,

  lifetimeColor?: LifetimeColorDescriptor,

  gravityModifier?: PSValueDescriptor,

  collision?: CollisionDescriptor,

  renderer?: RendererDescriptor,
}
