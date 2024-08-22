import { Vec3, Vec4, Mat4, Quat } from 'wgpu-matrix';
import { StructuredView } from 'webgpu-utils';
import DrawableInterface from './Drawables/DrawableInterface';
import { PropertyInterface, ValueType } from './ShaderBuilder/Types';
import { ShaderDescriptor } from './shaders/ShaderDescriptor';
import SceneNode2d from './Drawables/SceneNodes/SceneNode2d';
import ShaderGraph from './ShaderBuilder/ShaderGraph';
import { ParticleSystemDescriptor } from './ParticleSystem/Types';
import Shape from './ParticleSystem/Shapes/Shape';
import { MaterialItemInterface } from '../State/types';
import Component from './Drawables/Component';

export const maxInstances = 1000;

export interface ContainerNodeInterface extends SceneNodeInterface {
  nodes: SceneNodeInterface[];

  components: Set<Component>;

  addNode(node: SceneNodeInterface): void;

  removeNode(node: SceneNodeInterface): void;

  addComponent(component: Component): void;

  removeComponent(component: Component): void;
}

export interface RenderPassInterface {
  addDrawable(drawable: DrawableComponentInterface | SceneNode2d): void;
}

export interface RenderPass2DInterface {
}

export interface SceneObjectInterface {
  sceneNode: ContainerNodeInterface

  update(time: number, elapsedTime: number): Promise<void>
}

export interface SceneGraphInterface {
  addNode(node: SceneNodeInterface): void;

  removeNode(node: SceneNodeInterface): void;

  addSceneObject(object: SceneObjectInterface): void;

  removeSceneObject(object: SceneObjectInterface): void;
}

export interface RendererInterface {
  scene: SceneGraphInterface;

  decalPass: RenderPassInterface | null;

  deferredRenderPass: RenderPassInterface | null;

  transparentPass: RenderPassInterface | null;

  unlitRenderPass: RenderPassInterface | null;
}

export interface SceneNodeInterface {
  name: string;

  translate: Vec3;

  qRotate: Quat;

  angles: number[];

  scale: Vec3;

  transform: Mat4;

  computeTransform(transform: Mat4, prepend?: boolean): void;

  setFromAngles(x: number, y: number, z: number): void;

  getTransform(): Mat4;
}

export type DrawableType = 'Mesh' | 'Billboard' | 'HorizontalBillboard' | 'Circle' | 'Line' | '2D' | 'Mesh2D'| 'Decal'

export interface MaterialInterface {
  pipeline: PipelineInterface | null;

  color: Float32Array;

  lit: boolean;
  
  transparent: boolean;

  decal: boolean;

  setBindGroups(passEncoder: GPURenderPassEncoder): void;

  setPropertyValues(stage: GPUShaderStageFlags, properties: PropertyInterface[]): void;
  
  updateProperty(stage: GPUShaderStageFlags, name: string, value: ValueType): void;
}

export interface DrawableComponentInterface {
  name: string;

  drawable: DrawableInterface;

  material: MaterialInterface;
  
  color: Float32Array;

  instanceIndex: number;

  hitTest(origin: Vec4, vector: Vec4): { point: Vec4, t: number, drawable: DrawableInterface} | null;
}

export interface PipelineInterface {
  pipeline: GPURenderPipeline;

  vertexStageBindings: StageBindings | null

  fragmentStageBindings: StageBindings | null
}

export type PipelineAttributes = {

}

export type StageBindings = {
  binding: number,
  layout: GPUBindGroupLayout | null,
  properties: PropertyInterface[],
  structuredView: StructuredView | null,
}

export interface PipelineManagerInterface {
  getPipeline(
    drawableType: DrawableType,
    vertexProperties: PropertyInterface[],
    graph: ShaderGraph,
  ): Promise<PipelineInterface>
}

export interface ParticleSystemInterface {
  id: number

  shape: Shape;

  update(time: number, elapsedTime: number, scene: ContainerNodeInterface): Promise<void>

  removeParticles(scene: ContainerNodeInterface): void

  reset(): void
}

export type MaterialRecordDescriptor = {
  id: number,
  name: string,
  shaderId: number,
  properties: PropertyInterface[],
}

export type ShaderRecord = {
  id: number,
  name: string,
  descriptor: ShaderDescriptor,
}

export type ModelItem = {
  id: number,
  materials: Record<string, number>,
}

export type ParticleItem = {
  id: number,
}

export type DecalItem = {
  materialId?: number,
  width?: number,
  height?: number,
}

export type LightItem = {
  color: number[],
  constant: number,
  linear: number,
  quadratic: number,
}

export type ComponentType = 'model' | 'particle' | 'decal' | 'light';

export type GameObjectItem = {
  key?: number,
  type: ComponentType,
  item: ModelItem | ParticleItem | DecalItem | LightItem,
}

export type GameObject = {
  items: GameObjectItem[],
}

export type GameObjectRecord = {
  id: number,
  name: string,
  object: GameObject,
}

export type GameObject2D = {
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  material?: number,
}

export type GameObject2DRecord = {
  id: number,
  name: string,
  object: GameObject2D,
}

export const isGameObject2DRecord = (r: unknown): r is GameObject2DRecord => (
  (r as GameObject2DRecord).object !== undefined
  && (r as GameObject2DRecord).object.x !== undefined
  && (r as GameObject2DRecord).object.y !== undefined
  && (r as GameObject2DRecord).object.width !== undefined
  && (r as GameObject2DRecord).object.height !== undefined
)

export type ParticleRecord = {
  id: number,
  name: string,
  descriptor: ParticleSystemDescriptor,
}

export interface MaterialManagerInterface {
  saveItem(materialItem: MaterialItemInterface): Promise<void>
}