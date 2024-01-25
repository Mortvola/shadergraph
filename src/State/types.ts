import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";

export interface StoreInterface {
  applyChanges(): Promise<void>;
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

  deleteEdge(edge: GraphEdgeInterface): void;

  link(outputPort: OutputPortInterface, inputPort: InputPortInterface): void;

  setDragConnector(points: [number, number][] | null): void;

  addProperty(property: PropertyInterface): void;

  deleteProperty(property: PropertyInterface): void;

  createMaterialDescriptor(): MaterialDescriptor;
}

export type MaterialRecord = {
  id: number,
  name: string,
  shaderId: number,
  properties: PropertyInterface[],
}

export type ModelRecord = {
  id: number,
  name: string,
}

export type NodeMaterials = Record<string, number>;

export type GameObject = {
  modelId: number,
  materials?: NodeMaterials,
}

export type GameObjectRecord = {
  id: number,
  name: string,
  object: GameObject,
}
