import type { Vec4, Mat4 } from 'wgpu-matrix';
import type { PropertyInterface } from '../ShaderBuilder/Types';
import type { StructuredView } from 'webgpu-utils';

export type DrawableType = 'Mesh' | 'Billboard' | 'HorizontalBillboard' | 'Circle' | 'Line' | '2D' | 'Mesh2D'| 'Decal'

interface DrawableInterface {
  drawable: boolean;

  type: DrawableType;

  uuid: string;

  name: string;

  tag: string;

  modelMatrices: Float32Array

  inverseModelMatrices: Float32Array
  
  modelMatrixBuffer: GPUBuffer;

  inverseModelMatrixBuffer: GPUBuffer;

  instanceInfo: StructuredView;

  instanceColorBuffer: GPUBuffer;

  bindGroup: GPUBindGroup;

  numInstances: number;

  vertexProperties: PropertyInterface[];

  render(passEncoder: GPURenderPassEncoder): void;

  hitTest(origin: Vec4, vector: Vec4): { point: Vec4, t: number, drawable: DrawableInterface} | null;

  computeCentroid(): Vec4;

  addInstanceInfo(mat4: Mat4, color: Vec4): void;
}

export const isDrawableInterface = (r: unknown): r is DrawableInterface => (
  (r as DrawableInterface).drawable !== undefined
)

export default DrawableInterface;
