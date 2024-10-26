import Http from '../../Http/src';
import type SceneObject from './SceneObject';
import { type SceneObjectDescriptor } from './Types';

class ObjectManager {
  async update(object: SceneObject) {
    if (object.node == null) {
      throw new Error('node not set')
    }

    const response = await Http.put<SceneObjectDescriptor, void>(
      `/api/scene-objects/${object.node.id}`,
      object.toDescriptor(),
    );

    if (response.ok) { /* empty */ }
  }
}

export const objectManager = new ObjectManager;

export default ObjectManager;
