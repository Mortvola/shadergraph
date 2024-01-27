import { Quat, Vec3 } from "wgpu-matrix";
import SurfaceMesh from "../Renderer/Drawables/SurfaceMesh";

export interface FbxNodeInterface {
  name: string;
  
  scale: Vec3;

  translate: Vec3;

  qRotate: Quat;

  angles: number[];
}

export interface FbxGeometryNodeInterface extends FbxNodeInterface {
  mesh: SurfaceMesh;

  vertices: number[];
  
  normals: number[];

  texcoords: number[];
  
  indices: number[];
}

export interface FbxContainerNodeInterface extends FbxNodeInterface {
  nodes: FbxNodeInterface[];
}

export const isFbxContainerNode = (r: unknown): r is FbxContainerNodeInterface => (
  (r as FbxContainerNodeInterface).nodes !== undefined
)

export const isFbxGeometryNode = (r: unknown): r is FbxGeometryNodeInterface => (
  (r as FbxGeometryNodeInterface).mesh !== undefined
)
