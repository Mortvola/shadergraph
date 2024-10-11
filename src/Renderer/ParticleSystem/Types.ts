export type PSModuleDescriptor = {
  enabled?: boolean
}

export enum RenderMode {
  Billboard = 'Billboard',
  HorizontalBillboard = 'Horizontal Billboard',
  StretchedBillboard = 'Streteched Billboard',
  Mesh = 'Mesh',
}

export enum RenderAlignment {
  View = 'View',
  Local = 'Local',
  World = 'World,'
}

export type RendererDescriptor = PSModuleDescriptor & {
  mode?: RenderMode,
  materialId?: number,
  meshId?: number,
  renderAlignment?: RenderAlignment,
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
  RandomGradient = 'RandomGradient',
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

export type PSValue3DDescriptor = {
  separateAxes: boolean,
  type: PSValueType,
  values: [PSValueDescriptor, PSValueDescriptor, PSValueDescriptor]

  value?: [number, number],
}

export const isPSValue3DDescriptor = (r: unknown): r is PSValue3DDescriptor => (
  (r as PSValue3DDescriptor)?.separateAxes !== undefined
)

export const isPSValue = (r: unknown): r is PSValueDescriptor => (
  (r as PSValueDescriptor).type !== undefined
  && (r as PSValueDescriptor).value !== undefined
  && (r as PSValueDescriptor).curve !== undefined
);

export type LifetimeColorDescriptor = PSModuleDescriptor & {
  color?: PSColorDescriptor,
}

export type LifetimeSizeDescriptor = PSModuleDescriptor & {
  size?: PSValueDescriptor | PSValue3DDescriptor,
}

export type LifetimeVelocityDescriptor = PSModuleDescriptor & {
  speedModifier?: PSValueDescriptor,
}

export type CollisionDescriptor = PSModuleDescriptor & {
  bounce?: number,
  dampen?: number,
}

export type BurstsDescriptor = { time: number, count: PSValueDescriptor, cycles: number, probability: number }[];

export type EmissionsDescriptor = PSModuleDescriptor & {
  rate?: number,
  bursts?: BurstsDescriptor,
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
  startDelay?: number,
  loop?: boolean,
  maxPoints?: number,
  rate?: number,

  emissions?: EmissionsDescriptor,

  lifetime?: PSValueDescriptor,

  shape?: ShapeDescriptor,

  startVelocity?: PSValueDescriptor,

  startSize?: PSValue3DDescriptor,

  startRotation?: PSValue3DDescriptor,

  space?: SpaceType,

  lifetimeSize?: LifetimeSizeDescriptor,

  lifetimeVelocity?: LifetimeVelocityDescriptor,

  startColor?: PSColorDescriptor,

  lifetimeColor?: LifetimeColorDescriptor,

  gravityModifier?: PSValueDescriptor,

  collision?: CollisionDescriptor,

  renderer?: RendererDescriptor,
}
