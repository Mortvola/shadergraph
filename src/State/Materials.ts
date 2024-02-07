import Http from "../Http/src";
import Material from "../Renderer/Materials/Material";
import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";
import { DrawableNodeInterface } from "../Renderer/types";
import { MaterialInterface, MaterialRecord, MaterialsInterface, StoreInterface } from "./types";
import MaterialObject from './Material'

class Materials implements MaterialsInterface {
  materialMap: Map<number, Material> = new Map();
  
  shaderMap: Map<number, MaterialDescriptor> = new Map();

  store: StoreInterface

  constructor(store: StoreInterface) {
    this.store = store;
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    let material = this.materialMap.get(id);

    if (!material) {
      const item = this.store.getItem(id, 'material');

      if (item) {
        let materialObject = item.item as (MaterialObject | null);

        if (!materialObject) {
          const response = await Http.get<MaterialRecord>(`/materials/${item.itemId}`);

          if (response.ok) {
            const materialRecord = await response.body();

            if (materialRecord) {
              materialObject = new MaterialObject(materialRecord.id, materialRecord.name, materialRecord.shaderId, materialRecord.properties)

              item.item = materialObject;
            }      
          }
        }

        // const materialRecord = this.materials.find((m) => m.id === id);

        if (materialObject) {
          const shaderDescr = this.shaderMap.get(materialObject.shaderId);
        
          if (!shaderDescr) {
            const response = await Http.get<{ name: string, descriptor: MaterialDescriptor }>(`/shader-descriptors/${materialObject.shaderId}`);
  
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
