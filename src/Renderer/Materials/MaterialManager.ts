import Http from "../../Http/src";
import type { DrawableType } from "../Drawables/DrawableInterface";
import MaterialItem from "./MaterialItem";
import type { PropertyInterface } from "../ShaderBuilder/Types";
import { shaderManager } from "../shaders/ShaderManager";
import type { MaterialManagerInterface, MaterialRecordDescriptor } from "../Types";
import Material from "./Material";
import type { MaterialDescriptor } from "./MaterialDescriptor";

class MaterialManager implements MaterialManagerInterface {
  pendingMaterialItems: Map<number, Promise<MaterialItem | undefined>> = new Map();

  materialItems: Map<number, MaterialItem> = new Map()
  
  materials: Map<string | number, Map<string, Material>> = new Map()

  async getItem(id: number, withShaderDescriptor = true): Promise<MaterialItem | undefined> {
    let materialItem = this.materialItems.get(id)

    if (!materialItem) {
      let pendingRequest = this.pendingMaterialItems.get(id);

      if (pendingRequest === undefined) {
        pendingRequest = (async () => {
          const response = await Http.get<MaterialRecordDescriptor>(`/api/materials/${id}`);

          if (response.ok) {
            const materialItemDescriptor = await response.body();
    
            const newMaterialItem = new MaterialItem(this, materialItemDescriptor);

            this.materialItems.set(id, newMaterialItem)

            return newMaterialItem
          }  
        })()  

        this.pendingMaterialItems.set(id, pendingRequest)
      }

      materialItem = await pendingRequest

      this.pendingMaterialItems.delete(id)
    }

    if (materialItem) {
      if (withShaderDescriptor) {
        const shaderRecord = await shaderManager.getShader(materialItem.shaderId);

        materialItem.shaderDescriptor = shaderRecord?.descriptor;
      }

      return materialItem;
    }
  }

  async get(id: MaterialDescriptor | number | undefined, drawableType: DrawableType, vertexProperties: PropertyInterface[]): Promise<Material> {
    const key = JSON.stringify(id)
    const subKey = JSON.stringify({ drawableType, vertexProperties })

    const map = this.materials.get(key)

    if (!map) {      
      let descriptor: MaterialDescriptor | undefined = undefined

      if (typeof id === 'number') {
        descriptor = await this.getItem(id, false)
      }
      else {
        descriptor = id
      }

      const material = await Material.create(drawableType, vertexProperties, descriptor)

      const map: Map<string, Material> = new Map()

      map.set(subKey, material)

      this.materials.set(key, map)

      return material
    }

    let material = map.get(subKey)

    if (!material) {
      let descriptor: MaterialDescriptor | undefined = undefined

      if (typeof id === 'number') {
        descriptor = await this.getItem(id, false)
      }
      else {
        descriptor = id
      }

      material = await Material.create(drawableType, vertexProperties, descriptor)

      map.set(subKey, material)
    }

    return material
  }

  async applyPropertyValues(
    id: number,
    properties: PropertyInterface[]
  ) {
    const key = JSON.stringify(id)

    const map = this.materials.get(key)

    if (map) {
      // For each drawable type/vertex properties that uses this material.
      for (const [, material] of map) {
        material.setPropertyValues(GPUShaderStage.FRAGMENT, properties);
      }
    }

    Http.patch(`/api/materials/${id}`, {
      properties
    })
  }

  async saveItem(materialItem: MaterialItem): Promise<void> {
    const descriptor = await materialItem.toDescriptor();
    const response = await Http.patch<MaterialRecordDescriptor, void>(`/api/materials/${materialItem.id}`, descriptor);
  }
}

export const materialManager = new MaterialManager()
