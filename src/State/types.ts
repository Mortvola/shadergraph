import { ProjectItemInterface } from "../Project/Types/types";
import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import { DrawableNodeInterface } from "../Renderer/types";

export interface StoreInterface {
  materials: MaterialsInterface;

  applyChanges(): Promise<void>;

  getItem(id: number, type: string): ProjectItemInterface | undefined;
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

// Record of node names and assigned material id.
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

export type TextureRecord = {
  id: number,
  name: string,
  flipY: boolean,
}

export type ShaderRecord = {
  id: number,
  name: string,
  descriptor: MaterialDescriptor,
}

export interface EntityInterface {
  id: number;

  name: string;
}

export interface GameObjectInterface extends EntityInterface {
  modelId: number;

  materials?: NodeMaterials;
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

export const convertType = (type: string) => {
  switch (type) {
    case 'float':
      return '1';

    case 'vec2f':
      return '2';

    case 'vec4f':
      return '4';

    case 'texture2D':
      return 'T2';

    case 'sampler':
      return 'S';

    default:
      return type;
  }
}
