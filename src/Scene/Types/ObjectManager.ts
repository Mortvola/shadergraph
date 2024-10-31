import Http from '../../Http/src';
import type SceneObject from './SceneObject';
import { type SceneObjectDescriptor } from './Types';

class ObjectManager {
  async update(object: SceneObject) {
    if (object.id === undefined) {
      throw new Error('id not set')
    }

    const response = await Http.patch<Omit<SceneObjectDescriptor, 'id'>, void>(
      `/api/scene-objects/${object.id}`,
      object.toDescriptor(),
    );

    if (response.ok) { /* empty */ }
  }
}

export const objectManager = new ObjectManager;

export default ObjectManager;
