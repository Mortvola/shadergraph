import { runInAction } from "mobx";
import { SceneDescriptor, SceneInterface } from "../../State/types";
import ProjectItem from "./ProjectItem";
import Http from "../../Http/src";
import Scene from "../../Scene/Types/Scene";
import { FolderInterface, ProjectItemType } from "./types";

class SceneProjectItem extends ProjectItem<SceneInterface> {
  constructor(id: number, name: string, parent: FolderInterface | null, itemId: number | null) {
    super(id, name, ProjectItemType.Scene, parent, itemId);
  }

  async getItem(): Promise<SceneInterface | null> {
    if (this.item) {
      return this.item;
    }

    const response = await Http.get<SceneDescriptor>(`/scenes/${this.itemId}`);

    if (response.ok) {
      const body = await response.body();

      const scene = await Scene.fromDescriptor(body)

      if (scene) {
        runInAction(() => {
          this.item = scene;
        })

        return scene;
      }
    }  

    return null;
  }
}

export default SceneProjectItem;
