import Http from "../Http/src";
import Material from "../Renderer/Materials/Material";
import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";
import { DrawableNodeInterface } from "../Renderer/types";
import { MaterialRecord } from "./types";

class Materials {
  private materials: MaterialRecord[] = [];

  materialMap: Map<number, Material> = new Map();
  
  shaderMap: Map<number, MaterialDescriptor> = new Map();

  queried = false;

  async query() {
    if (!this.queried) {
      const response = await Http.get<MaterialRecord[]>('/materials-list');

      if (response.ok) {
        const list = await response.body()
  
        this.materials = list;

        this.queried = true;
      }
    }
  }

  async getList(): Promise<MaterialRecord[]> {
    await this.query();

    return this.materials;
  }

  async applyMaterial(id: number, node: DrawableNodeInterface): Promise<void> {
    let material = this.materialMap.get(id);

    if (!material) {
      const materialRecord = this.materials.find((m) => m.id === id);

      if (materialRecord) {
        const shaderDescr = this.shaderMap.get(materialRecord.shaderId);

        if (!shaderDescr) {
          const response = await Http.get<{ name: string, descriptor: MaterialDescriptor }>(`/shader-descriptors/${materialRecord.shaderId}`);

          if (response.ok) {
            const descr = await response.body();

            material = await Material.create(descr.descriptor);

            this.materialMap.set(id, material);
          }
        }
      }
    }

    if (material) {
      node.material = material;
    }
  }
}

export default Materials;
