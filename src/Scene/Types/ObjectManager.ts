import Http from "../../Http/src";
import SceneObject from './SceneObject';
import TreeNode from "./TreeNode";
import { type ComponentType } from "../../Renderer/Types";
import { type PropsBase } from "../../Renderer/Properties/Types";
import { type SceneObjectDescriptor } from "./Types";

class ObjectManager {
  async add(component: { type: ComponentType, props: PropsBase } | undefined, name: string, parentNode: TreeNode): Promise<TreeNode | undefined> {
    let descriptor: object | undefined

    if (component) {
      descriptor = {
        type: component.type,
        props: component.props.toDescriptor(),
      }
    }

    const response = await Http.post<unknown, SceneObjectDescriptor>(`/api/scene-objects`, {
      parentNodeId: parentNode.id,
      parentTreeId: parentNode.treeId,
      name,
      component: descriptor,
    });

    if (response.ok) {
      const body = await response.body();

      const node = new TreeNode(parentNode.scene)

      node.id = body.nodeId
      node.name = name
      node.nodeObject = await SceneObject.fromDescriptor(body);

      parentNode.addNode(node);

      return node
    }  
  }

  static getUrl(object: SceneObject) {
    return `${object.nodeId}${object.treeId !== undefined ? `/${object.treeId}` : ''}`
  }

  async update(object: SceneObject) {
    const response = await Http.put<SceneObjectDescriptor, void>(`/api/scene-objects/${ObjectManager.getUrl(object)}`, object.toDescriptor());

    if (response.ok) { /* empty */ }  
  }
}

export const objectManager = new ObjectManager;

export default ObjectManager;
