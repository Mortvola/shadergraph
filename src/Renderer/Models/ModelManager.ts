import { vec3 } from "wgpu-matrix";
import { downloadFbx } from "../../Fbx/LoadFbx";
import { type FbxNodeInterface, isFbxContainerNode, isFbxGeometryNode } from "../../Fbx/types";
import { type NodeMaterials } from "../../State/types";
import RenderNode from "../Drawables/SceneNodes/RenderNode";
import { type RenderNodeInterface } from "../Types";
import Mesh from "../Drawables/Mesh";
import DrawableComponent from "../Drawables/DrawableComponent";

class ModelManager {
  loading: Record<number, Promise<RenderNodeInterface | undefined>> = {}

  modelMap: Map<number, RenderNodeInterface> = new Map()

  async getModel(id: number) {
    const url = `/api/models/${id}`;

    let model = this.modelMap.get(id);

    if (!model) {
      const promise = this.loading[id]

      if (promise === undefined) {
        this.loading[id] = loadFbx(url);

        model = await this.loading[id]

        if (model) {
          this.modelMap.set(id, model)
        }
      }
      else {
        model = await promise
      }

      delete this.loading[id]
    }

    return model;
  }
}

export const modelManager = new ModelManager()

export default ModelManager;

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
