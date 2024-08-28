import { ProjectInterface, ProjectItemType } from "../Project/Types/types";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import { ComponentDescriptor, ComponentType, SceneObjectComponent, MaterialInterface, SceneNodeInterface, TransformPropsInterface, LightPropsDescriptor, PrefabComponent } from "../Renderer/types";
import ShaderGraph from "../Renderer/ShaderBuilder/ShaderGraph";
import { ParticleSystemPropsDescriptor } from "../Renderer/ParticleSystem/Types";

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

export const isGameObject = (r: unknown): r is SceneObjectInterface => (
  r !== undefined && r !== null &&
  (r as SceneObjectInterface).components !== undefined
)

export interface SceneInterface {
  name: string;

  selectedObject: SceneObjectInterface | null;

  rootObject: SceneObjectInterface;

  draggingItem: SceneObjectInterface | null;

  addObject(object: SceneObjectInterface): void;

  setSelectedObject(object: SceneObjectInterface): void;

  renderScene(): Promise<void>
}

export interface PrefabInterface {
  id: number;

  name: string;

  root?: PrefabNodeInterface;

  toDescriptor(): PrefabDescriptor;
}

export interface PrefabNodeInterface {
  id: number;

  name: string;

  components: PrefabComponent[]

  nodes: PrefabNodeInterface[]

  transformProps: TransformPropsInterface;

  prefab: PrefabInterface;

  toDescriptor(): PrefabNodeDescriptor;
}

export type PrefabPropsDescriptor = ParticleSystemPropsDescriptor | LightPropsDescriptor;

export type PrefabComponentDescriptor = {
  type: ComponentType,
  props: PrefabPropsDescriptor,
}

export type TransformPropsDescriptor = {
  translate: number[],
  rotate: number[],
  scale: number[],
}

export type TransformPropsOverrides = Partial<TransformPropsDescriptor>

export type PrefabDescriptor = {
  id: number,
  name: string,
  prefab: {
    root?: PrefabNodeDescriptor,
  }
}

export type PrefabNodeDescriptor = {
  id: number,
  name: string,
  components: PrefabComponentDescriptor[],
  transformProps?: TransformPropsDescriptor,
  nodes: PrefabNodeDescriptor[],
}

export interface SceneObjectInterface extends EntityInterface {
  transformProps: TransformPropsInterface;

  components: SceneObjectComponent[];

  objects: SceneObjectInterface[];

  sceneNode: SceneNodeInterface;

  parent: SceneObjectInterface | null;

  prefabNode: PrefabNodeInterface | null;

  changeName(name: string): void;

  save(): Promise<void>;

  addComponent(component: SceneObjectComponent): void;

  removeComponent(component: SceneObjectComponent): void;

  isAncestor(item: SceneObjectInterface): boolean;

  addObject(object: SceneObjectInterface): void;

  removeObject(object: SceneObjectInterface): void;

  detachSelf(): void;

  delete(): void;
}

export interface PrefabInstanceInterface {
  id: number

  save(): Promise<void>

  delete(): Promise<void>
}

export type SceneDescriptor = {
  id?: number,
  name: string,
  scene: {
    objects: number,
  }
}

export enum ObjectType {
  Object = 'object',
  Prefab = 'prefab',
}

export type SceneObjectDescriptor = {
  id?: number,
  name: string,
  object: {
    translate?: number[],
    rotate?: number[],
    scale?: number[],
    components?: ComponentDescriptor[],
    items?: ComponentDescriptor[],
    objects?: (number | { type: ObjectType, id: number } )[],  
  }
}

export type PrefabInstanceDescriptor = {
  id: number,
  name: string,
  object: {
    prefabId: number,
  }
}

export const isPrefabInstanceDescriptor = (r: unknown): r is PrefabInstanceDescriptor => (
  r !== undefined && r !== undefined
  && (r as PrefabInstanceDescriptor).object?.prefabId !== undefined
)

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

  setShaderId(id: number): void;
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
  type: ProjectItemType,
  itemId: number | null,
}
