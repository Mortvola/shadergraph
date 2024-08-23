import { makeObservable, observable, runInAction } from "mobx";
import SceneObject from "../../State/SceneObject";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";
import { store } from "../../State/store";
import { particleSystemManager } from "../../Renderer/ParticleSystem/ParticleSystemManager";
import { ParticleItem } from "../../Renderer/types";

class Scene {
  objects: SceneObject[] = [];

  selectedObject: SceneObject | null = null;

  constructor() {
    makeObservable(this, {
      objects: observable,
      selectedObject: observable,
    })
  }

  addObject(object: SceneObject) {
    runInAction(async () => {
      this.objects = [
        ...this.objects,
        object,
      ];

      const sceneNode = new SceneNode()

      for (const component of object.items) {
        if (component.type === 'particle') {
          const ps = await particleSystemManager.getParticleSystem((component.item as ParticleItem).id)

          if (ps) {
            sceneNode.addComponent(ps)
          }
        }
      }

      store.mainView.addSceneNode(sceneNode);
    })
  }
}

export default Scene;
