import type ObjectBase from "../../Scene/Types/ObjectBase";
import type PropertyBase from "./PropertyBase";

export type PropertyType<T> = { value: T, override?: boolean }

export class PropsBase {
  node?: ObjectBase
}

export type LineageEntry = { property: PropertyBase, name: string, container: string };

export enum PropertyType2 {
  Shape = 'Shape',
}

export interface PropertyBaseInterface {
  name: string;

  type?: PropertyType2

  original?: PropertyBase

  override: boolean

  toString(): string;

  revertOverride(): void

  applyOverride(property: PropertyBase): void

  getLineage(): LineageEntry[]
}

export const removeUndefinedKeys = <T extends Record<string, unknown>>(obj: T): T | undefined => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return Object.keys(obj).length > 0 ? obj : undefined;
};
