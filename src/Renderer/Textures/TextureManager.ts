import Http from "../../Http/src";
import { gpu } from "../Gpu";
import Texture from "./Texture";

type TextureMeta = {
  name: string,
  flipY: boolean,
}

class TextureManager {
  private textures: Map<number, Texture> = new Map();

  private pendingTextures: Map<number, Promise<Texture | undefined>> = new Map();

  public async get(textureId: number): Promise<Texture | undefined> {
    let texture = this.textures.get(textureId)

    if (!texture) {
      texture = await this.downloadTexture(textureId)
    }

    return texture;
  }

  private async downloadTexture(id: number): Promise<Texture | undefined> {
    let pendingTexture = this.pendingTextures.get(id)

    if (!pendingTexture) {
      pendingTexture = (async () => {
        const response = await Http.get<TextureMeta>(`/api/textures/${id}`)

        if (response.ok) {
          const body = await response.body()

          const gpuTexture = await this.retrieveTexture(id, body.flipY)

          if (gpuTexture === undefined) {
            // Failed to download the texture or create the GPU texture
            return undefined
          }

          const texture = new Texture(id, body.name, body.flipY, gpuTexture)

          this.textures.set(id, texture)

          return texture
        }
      })()

      this.pendingTextures.set(id, pendingTexture)
    }

    const textureMeta = await pendingTexture

    this.pendingTextures.delete(id)

    return textureMeta
  }

  private async retrieveTexture(textureId: number, flipY: boolean): Promise<GPUTexture | undefined> {
    const res = await Http.get(`/api/textures/${textureId}/file`);

    if (res.ok) {
      const blob = await res.blob();

      try {
        const image = await createImageBitmap(blob, { colorSpaceConversion: 'none' })

        const gpuTexture = gpu.device.createTexture({
          format: 'rgba8unorm',
          size: { width: image.width, height: image.height },
          usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        gpu.device.queue.copyExternalImageToTexture(
          { source: image, flipY },
          { texture: gpuTexture },
          { width: image.width, height: image.height },
        );

        return gpuTexture
      }
      catch (error) {
        console.log(error);
        throw(error);
      }
    }
  }
}

export const textureManager = new TextureManager()

export default TextureManager;
