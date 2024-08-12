import { ProjectInterface } from "../Project/Types/types";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import { GameObjectItem, MaterialInterface } from "../Renderer/types";
import ShaderGraph from "../Renderer/ShaderBuilder/ShaderGraph";

export interface ModelerInterface {
  applyMaterial(material: MaterialInterface): void
}

export interface StoreInterface {
  project: ProjectInterface

  // applyMaterial(): Promise<void>;

  previewModeler: ModelerInterface;
}

export interface MaterialsInterface {
}

export type CullMode = 'back' | 'none' | 'front';

export interface GraphInterface {
  id: number | null;
  
  name: string;

  changed: boolean;

  graph: ShaderGraph;

  selectedNode: GraphNodeInterface | null;
  
  setName(name: string): void;

  selectNode(node: GraphNodeInterface | null): void;

  deleteNode(node: GraphNodeInterface): void;

  setNodePosition(node: GraphNodeInterface, x: number, y: number): void;

  changeNodePosition(node: GraphNodeInterface, deltaX: number, deltaY: number): void;

  deleteEdge(edge: GraphEdgeInterface): void;

  link(outputPort: OutputPortInterface, inputPort: InputPortInterface): void;

  setDragConnector(points: [number, number][] | null): void;

  addProperty(property: PropertyInterface): void;

  deleteProperty(property: PropertyInterface): void;
}

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

export interface GameObjectInterface extends EntityInterface {
  items: GameObjectItem[]

  save(): Promise<void>
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

export interface ShaderInterface extends EntityInterface {

}

export interface MaterialItemInterface extends EntityInterface {
  id: number,

  name: string,

  shaderId: number;

  properties: PropertyInterface[];
}

export interface ModelInterface extends EntityInterface {

}

export interface TextureInterface extends EntityInterface {
  flipY: boolean,
}

export type ProjectItemRecord = {
  id: number,
  parentId: number,
  name: string,
  type: string,
  itemId: number | null,
}
