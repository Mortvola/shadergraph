import type NodeBase from "../../Scene/Types/NodeBase";

export type PropertyType<T> = { value: T, override?: boolean }

export class PropsBase {
  node?: NodeBase
}

export type LineageEntry = { id: number, name: string, container: string };

export interface PropertyBaseInterface {
  override: boolean

  revertOverride(): void

  getLineage(): LineageEntry[]
}

export const removeUndefinedKeys = <T extends Record<string, unknown>>(obj: T): T | undefined => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return Object.keys(obj).length > 0 ? obj : undefined;
};
