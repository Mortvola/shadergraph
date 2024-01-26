import { makeObservable, observable, runInAction } from "mobx";
import Http from "../Http/src";
import Material from "../Renderer/Materials/Material";
import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";
import { DrawableNodeInterface } from "../Renderer/types";
import { MaterialRecord, MaterialsInterface } from "./types";

class Materials implements MaterialsInterface {
  materials: MaterialRecord[] = [];

  materialMap: Map<number, Material> = new Map();
  
  shaderMap: Map<number, MaterialDescriptor> = new Map();

  queried = false;

  constructor() {
    makeObservable(this, {
      materials: observable,
    })
  }

  async query() {
    if (!this.queried) {
      const response = await Http.get<MaterialRecord[]>('/materials-list');

      if (response.ok) {
        const list = await response.body()
  
        runInAction(() => {
          this.materials = list;
          this.queried = true;  
        })
      }
    }
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

  applyPropertyValues(materialRecord: MaterialRecord) {
    let material = this.materialMap.get(materialRecord.id);

    if (material) {
      material.setPropertyValues(materialRecord.properties);
    }
  }

  getMaterialName(id: number): string | undefined {
    const materialRecord = this.materials.find((m) => m.id === id)

    return materialRecord?.name
  }
}

export default Materials;
