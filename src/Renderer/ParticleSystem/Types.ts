export enum RenderMode {
  Billboard = 'Billboard',
  FlatBillboard = 'FlatBillboard',
}

export type RendererDescriptor = {
  enabled: boolean,
  mode: RenderMode,
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

export type CollisionDescriptor = {
  enabled: boolean,
  bounce: number,
  dampen: number,
}

export enum ShapeType {
  Cone = 'Cone',
  Sphere = 'Sphere',
  Box = 'Box'
}

export type ConeDescriptor = {
  angle: number;
  originRadius: number;
}

export type SphereDescriptor = {
  radius: number;
}

export type ShapeDescriptor = {
  enabled: boolean,
  type: ShapeType,
  cone?: ConeDescriptor,
  sphere?: SphereDescriptor,
}

export type ParticleSystemDescriptor = {
  duration?: number,
  maxPoints?: number,
  rate?: number,

  lifetime?: PSValueDescriptor,

  shape?: ShapeDescriptor,

  startVelocity?: PSValueDescriptor,

  startSize?: PSValueDescriptor,

  lifetimeSize?: LifetimeSizeDescriptor,

  startColor?: PSColorDescriptor
  lifetimeColor?: LifetimeColorDescriptor,

  gravityModifier?: PSValueDescriptor,

  collision: CollisionDescriptor,

  renderer: RendererDescriptor,

  materialId?: number,
}
