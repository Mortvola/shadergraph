import Http from "../../Http/src";
import type { ShaderRecord } from "../Types";
import type { ShaderDescriptor } from "./ShaderDescriptor";

class ShaderManager {
  shaders: Map<number, ShaderRecord> = new Map()

  pendingShader: Map<number, Promise<ShaderRecord | undefined>> = new Map();

  async getShader(id: number): Promise<ShaderRecord | undefined> {
    let shaderRecord = this.shaders.get(id);

    if (shaderRecord === undefined) {
      let pendingRequest = this.pendingShader.get(id);

      if (pendingRequest === undefined) {
        pendingRequest = (async () => {
          let shaderRecord: ShaderRecord | undefined = undefined;

          const response = await Http.get<ShaderRecord>(`/api/shader-descriptors/${id}`)

          if (response.ok) {
            shaderRecord = await response.body();
      
            this.shaders.set(id, shaderRecord)
          }  
  
          return shaderRecord;
        })()

        this.pendingShader.set(id, pendingRequest)
      }

      shaderRecord = await pendingRequest;

      this.pendingShader.delete(id);
    }

    return shaderRecord
  }
}

export const shaderManager = new ShaderManager()
