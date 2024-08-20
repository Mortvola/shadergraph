import Http from "../../Http/src";
import MaterialItem from "../MaterialItem";
import { PropertyInterface } from "../ShaderBuilder/Types";
import { shaderManager } from "../shaders/ShaderManager";
import { DrawableType, MaterialRecordDescriptor } from "../types";
import Material from "./Material";
import { MaterialDescriptor } from "./MaterialDescriptor";

class MaterialManager {
  materialItems: Map<number, MaterialItem> = new Map()
  
  materials: Map<string | number, Map<string, Material>> = new Map()

  async getItem(id: number, withShaderDescriptor = true): Promise<MaterialDescriptor | undefined> {
    let materialItem = this.materialItems.get(id)

    if (!materialItem) {
      const response = await Http.get<MaterialRecordDescriptor>(`/materials/${id}`);

      if (response.ok) {
        const materialItemDescriptor = await response.body();

        materialItem = new MaterialItem(materialItemDescriptor);
        this.materialItems.set(id, materialItem)
      }  
    }

    if (materialItem) {
      if (withShaderDescriptor) {
        const shaderDescriptor = await shaderManager.getDescriptor(materialItem.shaderId);

        if (shaderDescriptor) {
          return {
            properties: [], // materialRecord.properties.map((p) => { }),
            shaderDescriptor: shaderDescriptor,
          }
        }
      }
      else {
        return ({
          ...materialRecord,

          shaderDescriptor: materialRecord.shaderId,
          
          properties: materialRecord.properties,
        })
      }
    }
  }

  async get(id: MaterialDescriptor | number | undefined, drawableType: DrawableType, vertexProperties: PropertyInterface[]): Promise<Material> {
    const key = JSON.stringify(id)
    const subKey = JSON.stringify({ drawableType, vertexProperties })

    let map = this.materials.get(key)

    if (!map) {      
      let descriptor: MaterialDescriptor | undefined = undefined

      if (typeof id === 'number') {
        descriptor = await this.getDescriptor(id, false)
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
        descriptor = await this.getDescriptor(id, false)
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
}

export const materialManager = new MaterialManager()
