import { makeObservable, observable, runInAction } from "mobx";
import SceneObject from "./SceneObject";
import { store } from "../../State/store";
import Http from "../../Http/src";
import { SceneDescriptor, SceneInterface } from "../../State/types";

class Scene implements SceneInterface {
  id?: number;

  name = '';

  rootObject = new SceneObject();

  selectedObject: SceneObject | null = null;

  draggingItem: SceneObject | null = null;

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
        // scene.rootObject.name = this.name;
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

  setSelectedObject(object: SceneObject) {
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
