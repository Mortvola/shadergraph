export type PropertyType<T> = { value: T, override?: boolean }

export const isProperty = (r: unknown): r is PropertyBaseInterface => (
  (r as PropertyBaseInterface)?.override !== undefined
)

export const isModule = (r: unknown): r is PSModuleInterface => (
  (r as PSModuleInterface)?.enabled !== undefined
  && (r as PSModuleInterface)?.hasOverrides !== undefined
)

export interface PropertyBaseInterface {
  override: boolean

  reactOnChange(observables: () => unknown): void
}

export const removeUndefinedKeys = <T extends Record<string, unknown>>(obj: T): T | undefined => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return Object.keys(obj).length > 0 ? obj : undefined;
};

export interface PropsBaseInterface {
  toDescriptor(overridesOnly: boolean): object | undefined;

  get hasOverrides(): boolean;
}

export interface PSModuleInterface {
  enabled: PropertyBaseInterface

  get hasOverrides(): boolean
}