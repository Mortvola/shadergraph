import { makeObservable, observable, runInAction } from "mobx";
import SceneObject from "./SceneObject";
import SceneNode from "../../Renderer/Drawables/SceneNodes/SceneNode";
import { store } from "../../State/store";
import { particleSystemManager } from "../../Renderer/ParticleSystem/ParticleSystemManager";
import { ComponentType, LightInterface, ParticleItem, ParticleSystemInterface } from "../../Renderer/types";
import Http from "../../Http/src";
import { SceneDescriptor, SceneInterface, SceneObjectInterface } from "../../State/types";

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

    // for (const object of this.objects.objects) {
    //   await this.renderObject(object);
    // }
  }

  async renderObject(object: SceneObject) {
    // object.sceneNode = new SceneNode()

    // object.sceneNode.translate[0] = object.translate[0];
    // object.sceneNode.translate[1] = object.translate[1];
    // object.sceneNode.translate[2] = object.translate[2];

    object.sceneNode.scale[0] = object.scale[0];
    object.sceneNode.scale[1] = object.scale[1];
    object.sceneNode.scale[2] = object.scale[2];

    // for (const component of object.items) {
    //   if (component.type === ComponentType.ParticleSystem) {
    //     object.sceneNode.addComponent(component.item as ParticleSystemInterface)
    //   }
    //   else if (component.type === ComponentType.Light) {
    //     object.sceneNode.addComponent(component.item as LightInterface)
    //   }
    // }

    store.mainView.addSceneNode(object.sceneNode);
  }

  addObject(object: SceneObject) {
    this.rootObject.addObject(object)
  }

  saveChanges = async () => {
    // console.log(`save scene changes: ${JSON.stringify(this.toDescriptor())}`)
    if (this.id === undefined) {
      await Http.post('/scenes', this.toDescriptor())  
    }
    else {
      await Http.patch(`/scenes/${this.id}`, this.toDescriptor())  
    }
  }
}

export default Scene;
