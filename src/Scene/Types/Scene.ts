import { makeObservable, observable, runInAction } from "mobx";
import SceneObject, { PrefabInstanceObject } from "./SceneObject";
import { store } from "../../State/store";
import Http from "../../Http/src";
import { SceneDescriptor, SceneInterface, SceneObjectBaseInterface } from "../../State/types";

class Scene implements SceneInterface {
  id?: number;

  name = '';

  rootObject: SceneObject | PrefabInstanceObject = new SceneObject();

  selectedObject: SceneObjectBaseInterface | null = null;

  draggingItem: SceneObjectBaseInterface | null = null;

  constructor() {
    makeObservable(this, {
      rootObject: observable,
      selectedObject: observable,
    })
  }

  static async fromDescriptor(descriptor?: SceneDescriptor) {
    const scene = new Scene();

    if (descriptor) {
      scene.id = descriptor.id;
      scene.name = descriptor.name;

      if (descriptor.scene.objects === null) {
        await scene.rootObject.save();
        await scene.saveChanges();
      }
      else {
        scene.rootObject = await SceneObject.fromServer(descriptor.scene.objects) ?? scene.rootObject;
      }
    }

    return scene;
  }

  toDescriptor(): SceneDescriptor {
    return ({
      id: this.id,
      name: this.name,
      scene: {
        objects: this.rootObject.id,
      }
    })
  }

  setSelectedObject(object: SceneObjectBaseInterface) {
    runInAction(() => {
      this.selectedObject = object;
    })
  }

  async renderScene() {
    store.mainView.addSceneNode(this.rootObject.sceneNode);
  }

  addObject(object: SceneObject) {
    this.rootObject.addObject(object)
  }

  saveChanges = async () => {
    if (this.id === undefined) {
      await Http.post('/scenes', this.toDescriptor())  
    }
    else {
      await Http.patch(`/scenes/${this.id}`, this.toDescriptor())  
    }
  }
}

export default Scene;
