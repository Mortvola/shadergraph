import { makeObservable, observable, runInAction } from "mobx";
import SceneObject from "../../State/SceneObject";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";
import { store } from "../../State/store";
import { particleSystemManager } from "../../Renderer/ParticleSystem/ParticleSystemManager";
import { ComponentType, LightInterface, ParticleItem } from "../../Renderer/types";

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

      object.sceneNode = new SceneNode()

      for (const component of object.items) {
        if (component.type === ComponentType.ParticleSystem) {
          const ps = await particleSystemManager.getParticleSystem((component.item as ParticleItem).id)

          if (ps) {
            object.sceneNode.addComponent(ps)
          }
        }
        else if (component.type === ComponentType.Light) {
          object.sceneNode.addComponent(component.item as LightInterface)
        }
      }

      store.mainView.addSceneNode(object.sceneNode);
    })
  }
}

export default Scene;
