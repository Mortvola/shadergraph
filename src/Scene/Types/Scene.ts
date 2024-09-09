import { makeObservable, observable, runInAction } from "mobx";
import SceneNode from "./SceneNode";
import { store } from "../../State/store";
import Http from "../../Http/src";
import type { SceneDescriptor } from "./Types";
import type { SceneNodeBaseInterface } from "./Types";
import type { SceneInterface } from "./Types";
import type PrefabNodeInstance from "./PrefabNodeInstance";
import { objectManager } from "./ObjectManager";

class Scene implements SceneInterface {
  id?: number;

  name = '';

  rootObject: SceneNode | PrefabNodeInstance = new SceneNode();

  selectedObject: SceneNodeBaseInterface | null = null;

  draggingItem: SceneNodeBaseInterface | null = null;

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
        scene.rootObject = await objectManager.get(descriptor.scene.objects) ?? scene.rootObject;
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

  setSelectedObject(object: SceneNodeBaseInterface) {
    runInAction(() => {
      this.selectedObject = object;
    })
  }

  async renderScene() {
    store.mainView.addSceneNode(this.rootObject.renderNode);
  }

  addObject(object: SceneNode) {
    this.rootObject.addObject(object)
  }

  saveChanges = async () => {
    if (this.id === undefined) {
      await Http.post('/api/scenes', this.toDescriptor())  
    }
    else {
      await Http.patch(`/api/scenes/${this.id}`, this.toDescriptor())  
    }
  }
}

export default Scene;
