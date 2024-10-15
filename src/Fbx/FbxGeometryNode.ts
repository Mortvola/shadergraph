import type SurfaceMesh from "../Renderer/Drawables/SurfaceMesh";
import FbxNode from "./FbxNode";
import type { FbxGeometryNodeInterface } from "./types";

class FbxGeometryNode extends FbxNode implements FbxGeometryNodeInterface {
  mesh: SurfaceMesh;

  vertices: number[];

  normals: number[];

  texcoords: number[];

  indices: number[];

  constructor(mesh: SurfaceMesh, vertices: number[], normals: number[], texcoords: number[], indices: number[]) {
    super();

    this.mesh = mesh;
    this.vertices = vertices;
    this.normals = normals;
    this.texcoords = texcoords;
    this.indices = indices;
  }
}

export default FbxGeometryNode;
