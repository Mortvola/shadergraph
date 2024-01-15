import { makeShaderDataDefinitions, makeStructuredView } from "webgpu-utils";
import { bindGroups } from "../BindGroups";
import DrawableInterface from "../Drawables/DrawableInterface";
import { gpu } from "../Gpu";
import { pipelineManager } from "../Pipelines/PipelineManager";
import { textureAttributes } from "../shaders/textureAttributes";
import { DrawableNodeInterface, MaterialInterface, PipelineInterface, maxInstances } from "../types";
import { MaterialDescriptor, TextureDescriptor } from "./MaterialDescriptor";

class Material implements MaterialInterface {
  pipeline: PipelineInterface | null = null;

  color = new Float32Array(4);

  colorBuffer: GPUBuffer;

  textureAttributesBuffer: GPUBuffer | null = null;

  bindGroup: GPUBindGroup;

  drawables: DrawableInterface[] = [];

  private constructor(materialDescriptor: MaterialDescriptor, bitmap?: ImageBitmap) {
    this.pipeline = pipelineManager.getPipelineByArgs(materialDescriptor)

    if (materialDescriptor.color) {
      this.color[0] = materialDescriptor.color[0];
      this.color[1] = materialDescriptor.color[1];
      this.color[2] = materialDescriptor.color[2];
      this.color[3] = materialDescriptor.color[3];  
    }
    else {
      this.color[0] = 0.8;
      this.color[1] = 0.8;
      this.color[2] = 0.8;
      this.color[3] = 1.0;  
    }

    if (materialDescriptor.texture && bitmap) {
      const texture = gpu.device.createTexture({
        format: 'rgba8unorm',
        size: [bitmap.width, bitmap.height],
        usage: GPUTextureUsage.TEXTURE_BINDING |
               GPUTextureUsage.COPY_DST |
               GPUTextureUsage.RENDER_ATTACHMENT,
      });
  
      gpu.device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture },
        { width: bitmap.width, height: bitmap.height },
      );
  
      const sampler = gpu.device.createSampler();
      
      this.colorBuffer = gpu.device.createBuffer({
        label: 'color',
        size: 4 * Float32Array.BYTES_PER_ELEMENT * maxInstances,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const defs = makeShaderDataDefinitions(textureAttributes);
      const textureAttributesStruct = makeStructuredView(defs.structs.TextureAttributes);

      this.textureAttributesBuffer = gpu.device.createBuffer({
        label: 'texture attributes',
        size: textureAttributesStruct.arrayBuffer.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      let scale = [1, 1];
      if (typeof materialDescriptor.texture !== 'string'
        && materialDescriptor.texture.scale
      ) {
        scale = materialDescriptor.texture.scale;
      }

      let offset = [0, 0];
      if (typeof materialDescriptor.texture !== 'string'
        && materialDescriptor.texture.offset
      ) {
        offset = materialDescriptor.texture.offset;
      }

      textureAttributesStruct.set({
        scale,
        offset,
      })

      gpu.device.queue.writeBuffer(this.textureAttributesBuffer, 0, textureAttributesStruct.arrayBuffer)

      this.bindGroup = gpu.device.createBindGroup({
        label: 'material',
        layout: bindGroups.getBindGroupLayout2(),
        entries: [
          { binding: 0, resource: { buffer: this.colorBuffer }},
          { binding: 1, resource: sampler },
          { binding: 2, resource: texture.createView() },
          { binding: 3, resource: { buffer: this.textureAttributesBuffer }}
        ],
      });  
    }
    else {
      this.colorBuffer = gpu.device.createBuffer({
        label: 'color',
        size: 4 * Float32Array.BYTES_PER_ELEMENT * maxInstances,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      this.bindGroup = gpu.device.createBindGroup({
        label: 'Color',
        layout: bindGroups.getBindGroupLayout2A(),
        entries: [
          { binding: 0, resource: { buffer: this.colorBuffer }},
        ],
      });
    }
  }

  static async create(materialDescriptor: MaterialDescriptor): Promise<Material> {
    let bitmap: ImageBitmap | undefined = undefined;

    if (materialDescriptor.texture) {
      let url: string;
      if (typeof materialDescriptor.texture === 'string') {
        url = materialDescriptor.texture;
      }
      else {
        url = (materialDescriptor.texture as TextureDescriptor).url;
      }

      const res = await fetch(url);
      const blob = await res.blob();
      try {
        bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });  
      }
      catch (error) {
        console.log(error);
      }
    }

    return new Material(materialDescriptor, bitmap);
  }

  addDrawable(drawableNode: DrawableNodeInterface): void {
    let entry = this.drawables.find((d) => d === drawableNode.drawable);

    if (!entry) {
      this.drawables.push(drawableNode.drawable);
    }
  }
}

export default Material;
