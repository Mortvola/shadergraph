import type {
  PropertyInterface,
} from "../Renderer/ShaderBuilder/Types";
import type {
  MaterialInterface,
} from "../Renderer/Types";

export interface ModelerInterface {
  applyMaterial(material: MaterialInterface): void
}

export type MaterialsInterface  = object;

export type ModelRecord = {
  id: number,
  name: string,
}

// Record of node names and assigned material id.
export type NodeMaterials = Record<string, number>;

export type TextureRecord = {
  id: number,
  name: string,
  flipY: boolean,
}

export interface EntityInterface {
  id: number;

  name: string;
}

export interface GameObject2DInterface extends EntityInterface {
  width: number

  height: number

  x: number

  y: number

  material: number | null

  nodes: GameObject2DInterface[]

  save(): Promise<void>
}

export const isGameObject2D = (r: unknown): r is GameObject2DInterface => (
  (r as GameObject2DInterface).x !== undefined
  && (r as GameObject2DInterface).y !== undefined
  && (r as GameObject2DInterface).width !== undefined
  && (r as GameObject2DInterface).height !== undefined
)

export type ShaderInterface = EntityInterface

export interface MaterialItemInterface extends EntityInterface {
  id: number,

  name: string,

  shaderId: number;

  properties: PropertyInterface[];

  setShaderId(id: number): void;
}

export type ModelInterface = EntityInterface

export interface TextureInterface extends EntityInterface {
  flipY: boolean,
}
