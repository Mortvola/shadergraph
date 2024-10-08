import { makeObservable, observable, runInAction } from "mobx";
import Mesh from "../Renderer/Drawables/Mesh";
import RenderNode, { isRenderNode } from "../Renderer/Drawables/SceneNodes/RenderNode";
import DrawableComponent from "../Renderer/Drawables/DrawableComponent";
import { isDrawableNode } from "../Renderer/Drawables/SceneNodes/utils";
import type Renderer from "../Renderer/Renderer";
import type { RenderNodeInterface, DrawableComponentInterface, MaterialInterface } from "../Renderer/Types";
import type { ModelerInterface, NodeMaterials } from "./types";
import { downloadFbx } from "../Fbx/LoadFbx";
import type { FbxNodeInterface} from "../Fbx/types";
import { isFbxContainerNode, isFbxGeometryNode } from "../Fbx/types";
import { materialManager } from "../Renderer/Materials/MaterialManager";
import { vec3 } from "wgpu-matrix";
import type { StoreInterface } from "./StoreInterface";

class Modeler implements ModelerInterface {
  model: RenderNodeInterface | null = null;

  loading: Record<number, Promise<RenderNodeInterface | undefined>> = {}

  renderer: Renderer;

  store: StoreInterface;

  modelMap: Map<string, RenderNodeInterface> = new Map()

  constructor(renderer: Renderer, store: StoreInterface) {
    this.renderer = renderer;
    this.store = store;

    makeObservable(this, {
      model: observable,
    })
  }

  async getModel(id: number, materials?: NodeMaterials) {
    const url = `/api/models/${id}`;

    let model = this.modelMap.get(url);

    if (!model) {
      const promise = this.loading[id]

      if (promise === undefined) {
        this.loading[id] = loadFbx(url);

        model = await this.loading[id]

        if (model) {
          this.modelMap.set(url, model)
        }  
      }
      else {
        model = await this.loading[id]
      }

      delete this.loading[id]
    }

    return model;
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
        // this.store.applyMaterial();  
      }
    })
  }

  async assignMaterals(model: RenderNodeInterface, materials: NodeMaterials) {
    let stack: RenderNodeInterface[] = [model];

    while (stack.length > 0) {
      const node = stack[0];
      stack = stack.slice(1);

      if (isDrawableNode(node)) {
        const id = materials[node.name];

        if (id !== undefined) {
          const material = await materialManager.get(id, 'Mesh', []);

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
      for (const child of node.nodes) {
        const n = this.getDrawableNode(child);

        if (isDrawableNode(n)) {
          return n;
        }
      }
    }
    else if (isDrawableNode(node)) {
      return node;
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

export const loadFbx = async (name: string): Promise<RenderNodeInterface | undefined> => {
  const result = await downloadFbx(name)

  if (result) {
    return parseFbxModel(result, name);
  }
}

const parseFbxModel = async (
  node: FbxNodeInterface,
  name: string,
  nodeMaterials?: NodeMaterials,
): Promise<RenderNodeInterface | undefined> => {
  if (isFbxContainerNode(node)) {
    const container = new RenderNode();

    vec3.copy(node.scale, container.scale);
    vec3.copy(node.translate, container.translate);
    container.qRotate = node.qRotate;
    container.angles = node.angles.map((a) => a);

    for (const n of node.nodes) {
      const newNode = await parseFbxModel(n, name, nodeMaterials);

      if (newNode) {
        container.addNode(newNode);          
      }
    }

    if (container.nodes.length === 0) {
      return undefined;
    }

    // if (container.nodes.length === 1) {
    //   return container.nodes[0];
    // }

    return container;
  }

  if (isFbxGeometryNode(node)) {
    // Have we already created this mesh?
    // let mesh = this.meshes.get(`${name}:${node.name}`)

    // if (!mesh) {
      // No, create the mesh now.
      const mesh = new Mesh(node.mesh, node.vertices, node.normals, node.texcoords, node.indices, 1);

    //   this.meshes.set(`${name}:${node.name}`, mesh)
    // }

    // let materialDescriptor: MaterialDescriptor | undefined

    // if (nodeMaterials) {
    //   const materialId = nodeMaterials[node.name]

    //   if (materialId !== undefined) {
    //     materialDescriptor = await this.getMaterial(materialId);
    //   }  
    // }

    // if (!materialDescriptor) {
    //   materialDescriptor = litMaterial;
    // }  

    const drawableNode = new RenderNode();
    const drawable = await DrawableComponent.create(mesh);

    drawableNode.addComponent(drawable);
    
    drawableNode.name = node.name;
    vec3.copy(node.scale, drawableNode.scale);
    vec3.copy(node.translate, drawableNode.translate);
    drawableNode.qRotate = node.qRotate;
    drawableNode.angles = node.angles.map((a) => a);

    return drawableNode;
  }

  return undefined;
}