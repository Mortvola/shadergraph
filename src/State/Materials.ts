import Http from "../Http/src";
import Material from "../Renderer/Materials/Material";
import { ShaderDescriptor } from "../Renderer/shaders/ShaderDescriptor";
import { DrawableNodeInterface, MaterialRecord } from "../Renderer/types";
import { MaterialInterface, MaterialsInterface, StoreInterface } from "./types";

class Materials implements MaterialsInterface {
  materialMap: Map<number, Material> = new Map();
  
  shaderMap: Map<number, ShaderDescriptor> = new Map();

  store: StoreInterface

  constructor(store: StoreInterface) {
    this.store = store;
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    let material = this.materialMap.get(id);

    if (!material) {
      const item = this.store.project.getItemByItemId(id, 'material');

      if (item) {
        let materialRecord = item.item as (MaterialRecord | null);

        if (!materialRecord) {
          const response = await Http.get<MaterialRecord>(`/materials/${item.itemId}`);

          if (response.ok) {
            materialRecord = await response.body();

            if (materialRecord) {
              item.item = materialRecord;
            }      
          }
        }

        // const materialRecord = this.materials.find((m) => m.id === id);

        if (materialRecord) {
          const shaderDescr = this.shaderMap.get(materialRecord.shaderId);
        
          if (!shaderDescr) {
            const response = await Http.get<{ name: string, descriptor: ShaderDescriptor }>(`/shader-descriptors/${materialRecord.shaderId}`);
  
            if (response.ok) {
              const descr = await response.body();
  
              material = await Material.create('Mesh', [], descr.descriptor);
  
              this.materialMap.set(id, material);
            }
          }  
        }
      }
    }

    return material
  }

  async applyMaterial(id: number, node: DrawableNodeInterface): Promise<void> {
    const material = await this.getMaterial(id);

    if (material) {
      node.material = material;
    }
  }

  applyPropertyValues(materialRecord: MaterialInterface) {
    let material = this.materialMap.get(materialRecord.id);

    if (material) {
      material.setPropertyValues(GPUShaderStage.FRAGMENT, materialRecord.properties);
    }
  }
}

export default Materials;
