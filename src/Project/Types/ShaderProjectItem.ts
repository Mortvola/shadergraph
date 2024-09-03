import { runInAction } from "mobx";
import Http from "../../Http/src";
import { ShaderRecord } from "../../Renderer/Types";
import Graph from "../../State/Graph";
import { store } from "../../State/store";
import ProjectItem from "./ProjectItem";
import { FolderInterface, ProjectItemType } from "./types";
import { GraphInterface } from "../../State/GraphInterface";

class ShaderProjectItem extends ProjectItem<GraphInterface> {
  constructor(id: number, name: string, parent: FolderInterface | null, itemId: number | null) {
    super(id, name, ProjectItemType.Shader, parent, itemId);
  }

  async getItem(): Promise<GraphInterface | null> {
    if (this.item) {
      return this.item;
    }

    const response = await Http.get<ShaderRecord>(`/api/shader-descriptors/${this.itemId}`)
  
    if (response.ok) {
      const descriptor = await response.body();

      const shader = new Graph(store, descriptor.id, descriptor.name, descriptor.descriptor);

      runInAction(() => {
        this.item = shader
      })

      return shader;
    }

    return null;
  }
}

export default ShaderProjectItem;
