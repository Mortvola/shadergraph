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

export type PSCurve = {
  points: [number, number][],
}

export type PSValueDescriptor = {
  type: PSValueType,
  value: [number, number],
  curve: [PSCurve, PSCurve],
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

export type ParticleDescriptor = {
  duration?: number,
  maxPoints?: number,
  rate?: number,
  angle?: number,

  lifetime?: PSValueDescriptor,

  originRadius?: number,
  
  startVelocity?: PSValueDescriptor,

  startSize?: PSValueDescriptor,

  lifetimeSize?: PSValueDescriptor,

  startColor?: PSColorDescriptor
  lifetimeColor?: LifetimeColorDescriptor,

  gravityModifier?: PSValueDescriptor,

  collisionEnabled?: boolean,
  bounce?: number,
  dampen?: number,

  materialId?: number,
}
