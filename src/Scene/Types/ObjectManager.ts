import Http from '../../Http/src';
import SceneObject from './SceneObject';
import TreeNode from './TreeNode';
import { type ComponentType } from '../../Renderer/Types';
import type PropsBase from '../../Renderer/Properties/PropsBase';
import { type SceneObjectDescriptor } from './Types';

class ObjectManager {
  async add(component: { type: ComponentType, props: PropsBase } | undefined, name: string, parentNode: TreeNode): Promise<TreeNode | undefined> {
    let descriptor: object | undefined

    if (component) {
      descriptor = {
        type: component.type,
        props: component.props.toDescriptor(),
      }
    }

    const response = await Http.post<unknown, SceneObjectDescriptor>('/api/scene-objects', {
      parentNodeId: parentNode.id,
      parentTreeId: parentNode.modifierNodeId,
      name,
      component: descriptor,
    });

    if (response.ok) {
      const body = await response.body();

      const node = new TreeNode(parentNode.scene, name)

      node.id = body.nodeId
      node.nodeObject = await SceneObject.fromDescriptor(body);

      parentNode.addNode(node);

      return node
    }
  }

  async update(object: SceneObject) {
    if (object.node == null) {
      throw new Error('node not set')
    }

    const response = await Http.put<SceneObjectDescriptor, void>(`/api/scene-objects/${object.node.id}`, object.toDescriptor());

    if (response.ok) { /* empty */ }
  }
}

export const objectManager = new ObjectManager;

export default ObjectManager;
