import Http from "../../Http/src";
import PrefabInstance from "./PrefabInstance";
import SceneObject from "./SceneObject";
import type { SceneObjectBase } from "./SceneObjectBase";
import {
  isPrefabInstanceDescriptor, type PrefabInstanceDescriptor, type SceneObjectDescriptor,
} from "./Types";

class ObjectManager {
  async get(id: number) {
    const response = await Http.get<SceneObjectDescriptor | PrefabInstanceDescriptor>(`/api/scene-objects/${id}`)

    if (response.ok) {
      const descriptor = await response.body();

      if (isPrefabInstanceDescriptor(descriptor)) {
        const prefabInstace = await PrefabInstance.fromDescriptor(descriptor);

        return prefabInstace?.root;
        // return undefined
      }

      return SceneObject.fromDescriptor(descriptor)
    }  
  }

  async add(object: SceneObjectBase) {
    const descriptor = object.toDescriptor();

    const response = await Http.post<Omit<unknown, 'id'>, { id: number }>(`/api/scene-objects`, descriptor);

    if (response.ok) {
      const body = await response.body();

      object.id = body.id;
    }  
  }

  async update(object: SceneObjectBase) {
    const response = await Http.patch<unknown, void>(`/api/scene-objects/${object.id}`, object.toDescriptor());

    if (response.ok) { /* empty */ }  

  }
}

export const objectManager = new ObjectManager;

export default ObjectManager;
