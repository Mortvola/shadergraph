import Http from "../../Http/src";
import { DrawableType } from "../Drawables/DrawableInterface";
import MaterialItem from "../MaterialItem";
import { PropertyInterface } from "../ShaderBuilder/Types";
import { shaderManager } from "../shaders/ShaderManager";
import { MaterialManagerInterface, MaterialRecordDescriptor } from "../Types";
import Material from "./Material";
import { MaterialDescriptor } from "./MaterialDescriptor";

class MaterialManager implements MaterialManagerInterface {
  materialItems: Map<number, MaterialItem> = new Map()
  
  materials: Map<string | number, Map<string, Material>> = new Map()

  async getItem(id: number, withShaderDescriptor = true): Promise<MaterialItem | undefined> {
    let materialItem = this.materialItems.get(id)

    if (!materialItem) {
      const response = await Http.get<MaterialRecordDescriptor>(`/api/materials/${id}`);

      if (response.ok) {
        const materialItemDescriptor = await response.body();

        materialItem = new MaterialItem(this, materialItemDescriptor);
        this.materialItems.set(id, materialItem)
      }  
    }

    if (materialItem) {
      if (withShaderDescriptor) {
        materialItem.shaderDescriptor = await shaderManager.getDescriptor(materialItem.shaderId);
      }

      return materialItem;
    }
  }

  async get(id: MaterialDescriptor | number | undefined, drawableType: DrawableType, vertexProperties: PropertyInterface[]): Promise<Material> {
    const key = JSON.stringify(id)
    const subKey = JSON.stringify({ drawableType, vertexProperties })

    let map = this.materials.get(key)

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

    let map = this.materials.get(key)

    if (map) {
      // For each drawable type/vertex properties that uses this material.
      for (const [, material] of map) {
        material.setPropertyValues(GPUShaderStage.FRAGMENT, properties);
      }
    }

    Http.patch(`/materials/${id}`, {
      properties
    })
  }

  setMaterialDescriptor(id: number, descriptor: MaterialDescriptor) {

  }

  async saveItem(materialItem: MaterialItem): Promise<void> {
    const descriptor = await materialItem.toDescriptor();
    const response = await Http.patch<MaterialRecordDescriptor, void>(`/api/materials/${materialItem.id}`, descriptor);
  }
}

export const materialManager = new MaterialManager()
