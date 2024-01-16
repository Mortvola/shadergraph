import Mesh from "../Drawables/Mesh";
import ContainerNode, { isContainerNode } from "../Drawables/SceneNodes/ContainerNode";
import DrawableNode from "../Drawables/SceneNodes/DrawableNode";
import { isGeometryNode } from "../Drawables/SceneNodes/GeometryNode";
import { isDrawableNode } from "../Drawables/SceneNodes/utils";
import { renderer } from "../Main";
import { litMaterial } from "../Materials/Lit";
import { DrawableNodeInterface, MaterialInterface, SceneNodeInterface } from "../types";
import { downloadFbx } from "./LoadFbx";

class Modeler {
  model: SceneNodeInterface | null = null;

  async loadModel(url: string) {
    this.model = await loadFbx(url);

    if (this.model) {
      renderer.addSceneNode(this.model);
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
    const container = new ContainerNode();

    for (const node of result) {
      if (isContainerNode(node)) {
        for (let i = 0; i < node.nodes.length; i += 1) {
          const child = node.nodes[i];

          if (isGeometryNode(child)) {
            const mesh = new Mesh(child.mesh, child.vertices, child.normals, child.texcoords, child.indices);

            // For now, just return the first mesh found...
            // return mesh;

            const drawableNode = await DrawableNode.create(mesh, litMaterial);

            node.nodes = [
              ...node.nodes.slice(0, i),
              drawableNode,
              ...node.nodes.slice(i + 1),
            ]
          }
        }

        container.addNode(node);
      }
      else if (isGeometryNode(node)) {
        const mesh = new Mesh(node.mesh, node.vertices, node.normals, node.texcoords, node.indices);

        // For now, just return the first mesh found...
        // return mesh;

        const drawableNode = await DrawableNode.create(mesh, litMaterial);

        container.addNode(drawableNode);
      }
    }

    return container;
  }

  return null;
}