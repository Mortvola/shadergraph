import { runInAction } from "mobx";
import Http from "../../Http/src";
import PrefabInstance from "./PrefabInstance";
import SceneObject from "./SceneObject";
import type { SceneObjectBase } from "./SceneObjectBase";
import type { SceneObjectBaseInterface} from "./Types";
import {
  isPrefabInstanceDescriptor, type PrefabInstanceDescriptor, type SceneObjectDescriptor,
} from "./Types";
import { isPrefabInstanceObject } from "./PrefabInstanceObject";

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

  async delete(object: SceneObjectBase) {
    if (isPrefabInstanceObject(object)) {
      const prefabInstance = object.prefabInstance;

      const response = await Http.delete(`/api/scene-objects/${prefabInstance.id}`);

      if (response.ok) {
        prefabInstance.autosave = false;
        
        const instanceRoot = object.prefabInstance.root;
        if (instanceRoot) {
          let stack: SceneObjectBaseInterface[] = [instanceRoot];
    
          while (stack.length > 0) {
            const instanceObject = stack[0];
            stack = stack.slice(1);
    
            // For the root node, detach it from its connection. This should
            // cause the parent object to save without the connection and
            // remove the scene node from the scene graph.
            // For all other nodes, just manually detach the scene node from the scene
            // graph.
            if (instanceObject === instanceRoot) {
              instanceObject.detachSelf();
            }
            else {
              instanceObject.sceneNode.detachSelf()
            }
    
            stack = stack.concat(instanceObject.objects.map((o) => o));
          }
        }
      }
    }
    else {
      const response = await Http.delete(`/api/scene-objects/${object.id}`);

      if (response.ok) {
        runInAction(() => {
          object.detachSelf()
        })
      }
    }
  }
}

export const objectManager = new ObjectManager;

export default ObjectManager;
