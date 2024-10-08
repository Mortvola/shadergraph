import type { Vec4 } from 'wgpu-matrix';
import type SurfaceMesh from "./SurfaceMesh";
import Drawable from './Drawable';
import type DrawableInterface from './DrawableInterface';
import { gpu } from '../Gpu';

class Mesh extends Drawable {
  mesh: SurfaceMesh;

  vertexBuffer: GPUBuffer;

  normalBuffer: GPUBuffer;

  texcoordBuffer: GPUBuffer;

  indexBuffer: GPUBuffer;

  indexFormat: GPUIndexFormat = "uint16";

  constructor(mesh: SurfaceMesh, vertices: number[], normals: number[], texcoord: number[], indices: number[], id: number) {
    super('Mesh', id)
  
    this.name = 'Mesh';
    
    this.mesh = mesh;

    this.vertexBuffer = gpu.device.createBuffer({
      size: vertices.length * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });  

    {
      const mapping = new Float32Array(this.vertexBuffer.getMappedRange());
      mapping.set(vertices, 0);
      this.vertexBuffer.unmap();  
    }

    this.normalBuffer = gpu.device.createBuffer({
      size: normals.length * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });  

    {
      const mapping = new Float32Array(this.normalBuffer.getMappedRange());
      mapping.set(normals, 0);
      this.normalBuffer.unmap();  
    }

    this.texcoordBuffer = gpu.device.createBuffer({
      size: texcoord.length * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });  

    {
      const mapping = new Float32Array(this.texcoordBuffer.getMappedRange());
      mapping.set(texcoord, 0);
      this.texcoordBuffer.unmap();  
    }

    if (indices.length > 0xFFFF) {
      this.indexFormat = "uint32";

      this.indexBuffer = gpu.device.createBuffer({
        size: (indices.length * Uint32Array.BYTES_PER_ELEMENT + 3) & ~3, // Make sure it is a multiple of four
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true,
      })
  
      {
        const mapping = new Uint32Array(this.indexBuffer.getMappedRange());
        mapping.set(indices, 0);
        this.indexBuffer.unmap();  
      }  
    }
    else {
      this.indexFormat = "uint16";

      this.indexBuffer = gpu.device.createBuffer({
        size: (indices.length * Uint16Array.BYTES_PER_ELEMENT + 3) & ~3, // Make sure it is a multiple of four
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true,
      })
  
      {
        const mapping = new Uint16Array(this.indexBuffer.getMappedRange());
        mapping.set(indices, 0);
        this.indexBuffer.unmap();  
      }  
    }
  }

  static async create(mesh: SurfaceMesh, id: number): Promise<Mesh> {
    const { vertices, normals, texcoords, indices } = await mesh.generateBuffers();

    return new Mesh(mesh, vertices, normals, texcoords, indices, id);
  }

  hitTest(origin: Vec4, vector: Vec4): { point: Vec4, t: number, drawable: DrawableInterface} | null {
    const result = this.mesh.hitTest(origin, vector);

    if (result) {
      return { point: result.point, t: result.t, drawable: this };      
    }

    return null;
  }

  render(passEncoder: GPURenderPassEncoder) {
    passEncoder.setVertexBuffer(0, this.vertexBuffer);
    passEncoder.setVertexBuffer(1, this.normalBuffer);
    passEncoder.setVertexBuffer(2, this.texcoordBuffer);
    passEncoder.setIndexBuffer(this.indexBuffer, this.indexFormat);

    passEncoder.drawIndexed(this.mesh.indexes.length, this.numInstances);
  }

  computeCentroid(): Vec4 {
    return this.mesh.computeCentroid()
  }
}

export default Mesh;
