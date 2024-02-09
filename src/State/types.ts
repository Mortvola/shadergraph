import { ProjectInterface } from "../Project/Types/types";
import { ShaderDescriptor } from "../Renderer/shaders/ShaderDescriptor";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import { DrawableNodeInterface, GameObjectItem, ParticleDescriptor } from "../Renderer/types";

export interface StoreInterface {
  materials: MaterialsInterface;

  project: ProjectInterface

  applyMaterial(): Promise<void>;
}

export interface MaterialsInterface {
  applyMaterial(id: number, node: DrawableNodeInterface): Promise<void>
}

export type CullMode = 'back' | 'none' | 'front';

export interface GraphInterface {
  id: number | null;
  
  name: string;

  changed: boolean;

  properties: PropertyInterface[];

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

  createMaterialDescriptor(): ShaderDescriptor;
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

export interface ShaderInterface extends EntityInterface {

}

export interface MaterialInterface extends EntityInterface {
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
