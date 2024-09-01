import { Vec3, Vec4, Mat4, Quat } from 'wgpu-matrix';
import { StructuredView } from 'webgpu-utils';
import DrawableInterface from './Drawables/DrawableInterface';
import { PropertyInterface, ValueType } from './ShaderBuilder/Types';
import { ShaderDescriptor } from './shaders/ShaderDescriptor';
import SceneNode2d from './Drawables/SceneNodes/SceneNode2d';
import ShaderGraph from './ShaderBuilder/ShaderGraph';
import { ParticleSystemPropsDescriptor, ParticleSystemPropsInterface, ParticleSystemPropsOverrides } from './ParticleSystem/Types';
import { MaterialItemInterface, TransformPropsDescriptor } from '../State/types';
import Component from './Drawables/Component';
import ParticleSystemProps from './ParticleSystem/ParticleSystemProps';
import LightProps from './Drawables/LightProps';
import { PropertyType } from './Properties/Types';
import { PSVec3Type } from './Properties/Property2';

export const maxInstances = 1000;

export interface SceneNodeInterface {
  nodes: SceneNodeInterface[];

  parentNode: SceneNodeInterface | null;

  components: Set<Component>;

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

  addNode(node: SceneNodeInterface): void;

  removeNode(node: SceneNodeInterface): void;

  detachSelf(): void;

  addComponent(component: Component): void;

  removeComponent(component: Component): void;
}

export interface RenderPassInterface {
  addDrawable(drawable: DrawableComponentInterface | SceneNode2d): void;
}

export interface RenderPass2DInterface {
}

export interface SceneGraphInterface {
  addNode(node: SceneNodeInterface): void;

  nodeAdded(node: SceneNodeInterface): void;

  removeNode(node: SceneNodeInterface): void;

  nodeRemoved(node: SceneNodeInterface): void;

  componentAdded(component: Component): void;
}

export interface RendererInterface {
  scene: SceneGraphInterface;

  decalPass: RenderPassInterface | null;

  deferredRenderPass: RenderPassInterface | null;

  transparentPass: RenderPassInterface | null;

  unlitRenderPass: RenderPassInterface | null;
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

export type ModelItemDescriptor = {

}

export type ModelItem = {
  id: number,
  materials: Record<string, number>,
  onChange?: () => void,

  toDescriptor: () => ComponentDescriptor,
}

export type ParticleItem = {
  id: number,
}

export type DecalItemDescriptor = {

}

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

  sceneNode: SceneNodeInterface | null;

  onChange?: () =>void;

  toDescriptor(): ComponentDescriptor;
}

export type ComponentDescriptor = {
  id?: number,
  type: ComponentType,
  props?: LightPropsDescriptor | ParticleSystemPropsDescriptor | DecalItemDescriptor | ModelItemDescriptor,
  item?: LightPropsDescriptor | ParticleSystemPropsDescriptor | DecalItemDescriptor | ModelItemDescriptor,
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

export type SceneObjectComponent = {
  id: number,
  type: ComponentType,
  props: ParticleSystemProps | LightProps,
  object?: ParticleSystemInterface | LightInterface,
}

export type NewSceneObjectComponent = Omit<SceneObjectComponent, 'id'>

export type PrefabComponent = {
  id: number,
  type: ComponentType,
  props: ParticleSystemProps | LightProps,
}

export interface TransformPropsInterface {
  translate: PSVec3Type;
  rotate: PSVec3Type;
  scale: PSVec3Type;

  toDescriptor(overridesOnly?: boolean): TransformPropsDescriptor | undefined;
}

export type GameObject = {
  items: SceneObjectComponent[],
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