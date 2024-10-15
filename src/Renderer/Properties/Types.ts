import type { SceneObjectInterface } from "../../Scene/Types/Types";

export type PropertyType<T> = { value: T, override?: boolean }

export const isProperty = (r: unknown): r is PropertyBaseInterface => (
  (r as PropertyBaseInterface)?.override !== undefined
)

export const isModule = (r: unknown): r is PSModuleInterface => (
  (r as PSModuleInterface)?.enabled !== undefined
  && (r as PSModuleInterface)?.hasOverrides !== undefined
)

export type LineageEntry = { property: PropertyBaseInterface, name: string, container: string };

export interface PropertyBaseInterface {
  name: string;

  base?: PropertyBaseInterface

  override: boolean

  variations: Set<PropertyBaseInterface>;

  props: PropsBaseInterface;

  toString(): string;

  revertOverride(): void

  applyOverride(property: PropertyBaseInterface): void

  lineage(): LineageEntry[]

  copyProp(_other: PropertyBaseInterface): void

  enableReaction(): void

  disableReaction(): void

  propogate(): void

  reactOnChange(observables: () => unknown): void
}

export const removeUndefinedKeys = <T extends Record<string, unknown>>(obj: T): T | undefined => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return Object.keys(obj).length > 0 ? obj : undefined;
};

export interface PropsBaseInterface {
  nodeObject?: SceneObjectInterface;

  toDescriptor(): object | undefined;

  get hasOverrides(): boolean;
}

export interface PSModuleInterface {
  enabled: PropertyBaseInterface

  get hasOverrides(): boolean
}