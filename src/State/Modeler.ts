import { makeObservable, observable, runInAction } from "mobx";
import Mesh from "../Renderer/Drawables/Mesh";
import ContainerNode, { isContainerNode } from "../Renderer/Drawables/SceneNodes/ContainerNode";
import DrawableNode from "../Renderer/Drawables/SceneNodes/DrawableNode";
import { isDrawableNode } from "../Renderer/Drawables/SceneNodes/utils";
import { litMaterial } from "../Renderer/Materials/Lit";
import Renderer from "../Renderer/Renderer";
import { DrawableNodeInterface, MaterialInterface, SceneNodeInterface } from "../Renderer/types";
import { NodeMaterials, StoreInterface } from "./types";
import { downloadFbx } from "../Fbx/LoadFbx";
import { FbxNodeInterface, isFbxContainerNode, isFbxGeometryNode } from "../Fbx/types";
import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";

class Modeler {
  model: SceneNodeInterface | null = null;

  loading = false;

  renderer: Renderer;

  store: StoreInterface;

  constructor(renderer: Renderer, store: StoreInterface) {
    this.renderer = renderer;
    this.store = store;

    makeObservable(this, {
      model: observable,
    })
  }

  async loadModel(url: string, materials?: NodeMaterials) {
    if (!this.loading) {
      this.loading = true;
      const model = await loadFbx(url);

      if (model) {
        this.assignModel(model, materials)
      }

      this.loading = false;
    }
  }

  async assignModel(model: SceneNodeInterface, materials?: NodeMaterials) {
    if (this.model) {
      this.renderer.removeSceneNode(this.model);
    }

    // Traverse model tree and assign materials.
    if (materials) {
      await this.assignMaterals(model, materials)
    }
    
    runInAction(() => {
      this.model = model;
      this.renderer.addSceneNode(this.model);
      this.store.applyMaterial();
    })
  }

  async assignMaterals(model: SceneNodeInterface, materials: NodeMaterials) {
    let stack: SceneNodeInterface[] = [model];

    while (stack.length > 0) {
      const node = stack[0];
      stack = stack.slice(1);

      if (isDrawableNode(node)) {
        const id = materials[node.name];

        if (id !== undefined) {
          await this.store.materials.applyMaterial(id, node);
        }
      }
      else if (isContainerNode(node)) {
        stack = stack.concat(node.nodes)
      }
    }
  }

  getDrawableNode(node: SceneNodeInterface): DrawableNodeInterface | null {
    if (isContainerNode(node)) {
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

export const loadFbx = async (name: string): Promise<SceneNodeInterface | null> => {
  const result = await downloadFbx(name)

  if (result) {
    return parseFbxModel(result, name);
  }

  return null;
}

const parseFbxModel = async (
  node: FbxNodeInterface,
  name: string,
  nodeMaterials?: NodeMaterials,
): Promise<SceneNodeInterface | null> => {
  if (isFbxContainerNode(node)) {
    const container = new ContainerNode();

    container.scale = node.scale;
    container.translate = node.translate;
    container.qRotate = node.qRotate;
    container.angles = node.angles.map((a) => a);

    for (const n of node.nodes) {
      const newNode = await parseFbxModel(n, name, nodeMaterials);

      if (newNode) {
        container.addNode(newNode);          
      }
    }

    if (container.nodes.length === 0) {
      return null;
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
      const mesh = new Mesh(node.mesh, node.vertices, node.normals, node.texcoords, node.indices);

    //   this.meshes.set(`${name}:${node.name}`, mesh)
    // }

    let materialDescriptor: MaterialDescriptor | undefined

    // if (nodeMaterials) {
    //   const materialId = nodeMaterials[node.name]

    //   if (materialId !== undefined) {
    //     materialDescriptor = await this.getMaterial(materialId);
    //   }  
    // }

    if (!materialDescriptor) {
      materialDescriptor = litMaterial;
    }  

    const drawableNode = await DrawableNode.create(mesh, materialDescriptor);
    
    drawableNode.name = node.name;
    drawableNode.scale = node.scale;
    drawableNode.translate = node.translate;
    drawableNode.qRotate = node.qRotate;
    drawableNode.angles = node.angles.map((a) => a);

    return drawableNode;
  }

  return null;
}