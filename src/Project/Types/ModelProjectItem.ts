import { runInAction } from "mobx";
import { modelManager } from "../../Renderer/Models/ModelManager";
import ProjectItem from "./ProjectItem";
import { type ModelItemInterface } from "../../State/types";
import ModelItem from "../../Renderer/Models/ModelItem";

class ModelProjectItem extends ProjectItem<ModelItemInterface> {
  materials: Record<string, number> = {};

  toDescriptor() {

  }

  async getItem(): Promise<ModelItemInterface | null> {
    if (this.item) {
      return this.item;
    }

    if (this.itemId !==  null) {
      const model = await modelManager.getModel(this.itemId) ?? null;

      if (model) {
        runInAction(() => {
          this.item = new ModelItem(model);
        })

        return this.item;
      }
    }

    return null;
  }
}

export default ModelProjectItem;
