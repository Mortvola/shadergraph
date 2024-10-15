import { makeObservable, observable, runInAction } from "mobx";
import { isRenderNode } from "../Renderer/Drawables/SceneNodes/RenderNode";
import { isDrawableComponent } from "../Renderer/Drawables/SceneNodes/utils";
import type Renderer from "../Renderer/Renderer";
import { type RenderNodeInterface, type DrawableComponentInterface, type MaterialInterface } from "../Renderer/Types";
import type { ModelerInterface, NodeMaterials } from "./types";
import { materialManager } from "../Renderer/Materials/MaterialManager";
import { DrawableType } from "../Renderer/Drawables/DrawableInterface";

class Modeler implements ModelerInterface {
  model: RenderNodeInterface | null = null;

  renderer: Renderer;

  constructor(renderer: Renderer) {
    this.renderer = renderer;

    makeObservable(this, {
      model: observable,
    })
  }

  async assignModel(model: RenderNodeInterface | null, materials?: NodeMaterials) {
    if (this.model) {
      this.renderer.removeSceneNode(this.model);
    }

    // Traverse model tree and assign materials.
    if (model && materials) {
      await this.assignMaterals(model, materials)
    }

    runInAction(() => {
      this.model = model;

      if (model) {
        this.renderer.addSceneNode(model);
      }
    })
  }

  async assignMaterals(model: RenderNodeInterface, materials: NodeMaterials) {
    let stack: RenderNodeInterface[] = [model];

    while (stack.length > 0) {
      const node = stack[0];
      stack = stack.slice(1);

      if (isDrawableComponent(node)) {
        const id = materials[node.name];

        if (id !== undefined) {
          const material = await materialManager.get(id, DrawableType.Mesh, []);

          if (material) {
            node.material = material;
          }
        }
      }
      else if (isRenderNode(node)) {
        stack = stack.concat(node.nodes)
      }
    }
  }

  getDrawableNode(node: RenderNodeInterface): DrawableComponentInterface | null {
    if (isRenderNode(node)) {
      for (const component of node.components) {
        if (isDrawableComponent(component)) {
          return component
        }
      }

      for (const child of node.nodes) {
        const result = this.getDrawableNode(child);

        if (result !== null) {
          return result;
        }
      }
    }

    return null;
  }

  applyMaterial(material: MaterialInterface) {
    if (this.model) {
      const drawable = this.getDrawableNode(this.model);

      if (drawable) {
        drawable.material = material;
      }
    }
  }
}

export default Modeler;
