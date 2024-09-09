import type { Vec3, Vec4, Mat4, Quat } from 'wgpu-matrix';
import type { StructuredView } from 'webgpu-utils';
import type { DrawableType } from './Drawables/DrawableInterface';
import type DrawableInterface from './Drawables/DrawableInterface';
import type { PropertyInterface } from './ShaderBuilder/Types';
import type { ShaderDescriptor } from './shaders/ShaderDescriptor';
import type SceneNode2d from './Drawables/SceneNodes/SceneNode2d';
import type ShaderGraph from './ShaderBuilder/ShaderGraph';
import type { ParticleSystemPropsDescriptor } from './ParticleSystem/Types';
import type { MaterialItemInterface } from '../State/types';
import type ParticleSystemProps from './ParticleSystem/ParticleSystemProps';
import type LightProps from './Properties/LightProps';
import type { PSVec3Type } from './Properties/Property';
import type { ValueType } from './ShaderBuilder/GraphDescriptor';
import type { ParticleSystemPropsInterface } from './ParticleSystem/ParticleSystemPropsInterface';
import type { TransformPropsDescriptor } from '../Scene/Types/Types';

export interface RenderNodeInterface {
  nodes: RenderNodeInterface[];

  parentNode: RenderNodeInterface | null;

  components: Set<ComponentInterface>;

  name: string;

  translate: Vec3;

  scale: Vec3;

  qRotate: Quat;

  angles: number[];

  transform: Mat4;

  scene: SceneGraphInterface | null;

  computeTransform(transform: Mat4, prepend?: boolean): void;

  updateTransforms(mat: Mat4, renderer: RendererInterface | null): void;

  setFromAngles(x: number, y: number, z: number): void;

  getTransform(): Mat4;

  addNode(node: RenderNodeInterface): void;

  removeNode(node: RenderNodeInterface): void;

  detachSelf(): void;

  addComponent(component: ComponentInterface): void;

  removeComponent(component: ComponentInterface): void;
}

export interface RenderPassInterface {
  addDrawable(drawable: DrawableComponentInterface | SceneNode2d): void;
}

export type RenderPass2DInterface = object;

export interface SceneGraphInterface {
  addNode(node: RenderNodeInterface): void;

  nodeAdded(node: RenderNodeInterface): void;

  removeNode(node: RenderNodeInterface): void;

  nodeRemoved(node: RenderNodeInterface): void;

  componentAdded(component: ComponentInterface): void;
}

export interface RendererInterface {
  scene: SceneGraphInterface;

  decalPass: RenderPassInterface | null;

  deferredRenderPass: RenderPassInterface | null;

  transparentPass: RenderPassInterface | null;

  unlitRenderPass: RenderPassInterface | null;
}

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

export type PipelineAttributes = object;

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

export interface ParticleSystemInterface extends ComponentInterface {
  props: ParticleSystemPropsInterface

  update(time: number, elapsedTime: number): Promise<void>

  removeParticles(): void

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

export type ModelItemDescriptor = object

export type ModelItem = {
  id: number,
  materials: Record<string, number>,
  onChange?: () => void,

  toDescriptor: () => ComponentDescriptor,
}

export type ParticleItem = {
  id: number,
}

export type DecalItemDescriptor = object

export type DecalItem = {
  materialId?: number,
  width?: number,
  height?: number,

  onChange?: () => void,

  toDescriptor: () => ComponentDescriptor;
}

export enum ComponentType {
  Drawable = 'Drawable',
  Light = 'Light',
  RangeCircle = 'RangeCircle',
  ParticleSystem = 'ParticleSystem',
  Mesh = 'Mesh',
  Decal = 'Decal',
}

export interface ComponentInterface {
  type: ComponentType;

  renderNode: RenderNodeInterface | null;

  onChange?: () =>void;

  toDescriptor(): ComponentDescriptor;
}

export type ComponentDescriptor = {
  id: number,
  type: ComponentType,
  props?: LightPropsDescriptor | ParticleSystemPropsDescriptor | DecalItemDescriptor | ModelItemDescriptor,
}

export type LightPropsDescriptor = {
  color: number[],
  constant: number,
  linear: number,
  quadratic: number,
}

export type LightPropsOverrides = Partial<LightPropsDescriptor>

export interface LightPropsInterface {
  color: number[],
  constant: number,
  linear: number,
  quadratic: number,

  handleChange: () => void,
}

export interface LightInterface extends ComponentInterface {
  props: LightPropsInterface;
}

export type SceneNodeComponent = {
  id: number,
  type: ComponentType,
  props: ParticleSystemProps | LightProps,
  component?: ParticleSystemInterface | LightInterface,
}

export type NewSceneNodeComponent = Omit<SceneNodeComponent, 'id'>

export interface TransformPropsInterface {
  translate: PSVec3Type;
  rotate: PSVec3Type;
  scale: PSVec3Type;

  toDescriptor(overridesOnly?: boolean): TransformPropsDescriptor | undefined;
}

export type GameObject = {
  items: SceneNodeComponent[],
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
  descriptor: ParticleSystemPropsDescriptor,
}

export interface MaterialManagerInterface {
  saveItem(materialItem: MaterialItemInterface): Promise<void>
}