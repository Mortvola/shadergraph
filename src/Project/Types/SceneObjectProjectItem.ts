import { runInAction } from "mobx";
import type SceneNode from "../../Scene/Types/SceneNode";
import type { SceneNodeInterface } from "../../Scene/Types/Types";
import ProjectItem from "./ProjectItem";
import { ComponentType } from "../../Renderer/Types";
import type { FolderInterface} from "./types";
import { ProjectItemType } from "./types";
import { objectManager } from "../../Scene/Types/ObjectManager";

class SceneObjectProjectItem extends ProjectItem<SceneNodeInterface> {
  constructor(id: number, name: string, parent: FolderInterface | null, itemId: number | null) {
    super(id, name, ProjectItemType.SceneObject, parent, itemId);
  }

  async getItem(): Promise<SceneNodeInterface | null> {
    if (this.item) {
      return this.item;
    }

    if (this.itemId !== null) {
      const object = (await objectManager.get(this.itemId) ?? null) as SceneNode;;

      runInAction(() => {
        this.item = object;
      })

      if (object) {
        // if (object instanceof SceneObject) {
          // const gameObject = object;

          // this.mainViewModeler.assignModel(null)

          for (const component  of object.components) {
            if (component.type === ComponentType.Mesh) {
              // const modelEntry = item as ModelItem;

              // const modelItem = this.project.getItemByItemId(modelEntry.id, 'model');

              // if (modelItem) {
              //   const model = await this.getModel(modelItem)
        
              //   if (model) {
              //     this.mainViewModeler.assignModel(model, modelEntry.materials);
              //   }
              // }    
            }
            // else if (component.type === ComponentType.ParticleSystem) {
              // const particleEntry = item as ParticleItem;

              // const particleSystem = await particleSystemManager.getParticleSystem(particleEntry.id)
      
              // if (particleSystem) {
              //   const node = new SceneNode();
              //   node.addComponent(particleSystem)

              //   this.mainView.addSceneNode(node)
              // }
            // }
            else if (component.type === ComponentType.Decal) {
              // const decal = item as DecalItem;

              // const drawableNode = new SceneNode();
              // const drawable = await DrawableComponent.create(
              //   await Mesh.create(box(1, 1, 1), 1),
              //   decal.materialId,
              // )
              // drawableNode.addComponent(drawable);

              // drawableNode.scale = vec3.create(decal.width ?? 1, 1, decal.height ?? 1)

              // this.mainView.scene.addNode(drawableNode)
            }
          }
        }
        // else if (object instanceof GameObject2DData) {
        //   // this.mainViewModeler.assignModel(null);

        //   const test = new SceneNode2d()
        //   test.x = item.x;
        //   test.y = item.y;
        //   test.width = item.width
        //   test.height = item.height
        //   // test.material = await materialManager.get(item.material!, '2D', [])

        //   // this.mainView.scene2d.scene2d.nodes.push(test)
        // }

        return object;
      // }
    }

    return null;
  }
}

export default SceneObjectProjectItem;
